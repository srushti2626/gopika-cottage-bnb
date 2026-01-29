import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { eachDayOfInterval, format, isWithinInterval, parseISO } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type RoomType = Database["public"]["Enums"]["room_type"];

interface Room {
  id: string;
  name: string;
  room_type: RoomType;
  price_per_night: number;
  max_guests: number;
  description: string | null;
  image_url: string | null;
}

interface BlockedDate {
  id: string;
  room_id: string | null;
  blocked_date: string;
}

interface Booking {
  room_id: string;
  check_in_date: string;
  check_out_date: string;
}

export function useRoomAvailability() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .eq("is_active", true);

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);

      // Fetch blocked dates
      const { data: blockedData, error: blockedError } = await supabase
        // Public view exposes only the minimal data required for availability
        .from("blocked_dates_public")
        .select("id, room_id, blocked_date");

      if (blockedError) throw blockedError;
      setBlockedDates(blockedData || []);

      // Fetch existing bookings availability (public view; no guest info)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("booking_availability")
        .select("room_id, check_in_date, check_out_date");

      if (bookingsError) throw bookingsError;
      setExistingBookings(bookingsData || []);
    } catch (error) {
      console.error("Error fetching availability data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomsByType = (roomType: RoomType): Room[] => {
    return rooms.filter((room) => room.room_type === roomType);
  };

  const getPriceByRoomType = (roomType: RoomType): number => {
    const room = rooms.find((r) => r.room_type === roomType);
    return room?.price_per_night || (roomType === "ac" ? 3000 : 2000);
  };

  const isDateBlockedForRoom = (date: Date, roomId: string): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blockedDates.some(
      (blocked) =>
        blocked.blocked_date === dateStr &&
        (blocked.room_id === roomId || blocked.room_id === null)
    );
  };

  const isDateBookedForRoom = (date: Date, roomId: string): boolean => {
    const dateStr = format(date, "yyyy-MM-dd");
    return existingBookings.some((booking) => {
      if (booking.room_id !== roomId) return false;
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      return isWithinInterval(parseISO(dateStr), { start: checkIn, end: checkOut });
    });
  };

  const getAvailableRoomsForDateRange = (
    checkIn: Date,
    checkOut: Date,
    roomType: RoomType
  ): Room[] => {
    const roomsOfType = getRoomsByType(roomType);
    const datesInRange = eachDayOfInterval({ start: checkIn, end: checkOut });

    return roomsOfType.filter((room) => {
      // Check if any date in range is blocked or booked
      const hasConflict = datesInRange.some(
        (date) =>
          isDateBlockedForRoom(date, room.id) || isDateBookedForRoom(date, room.id)
      );
      return !hasConflict;
    });
  };

  const checkAvailability = (
    checkIn: Date | undefined,
    checkOut: Date | undefined,
    roomType: RoomType
  ): { available: boolean; availableRooms: Room[]; message: string } => {
    if (!checkIn || !checkOut) {
      return {
        available: false,
        availableRooms: [],
        message: "Please select check-in and check-out dates",
      };
    }

    const availableRooms = getAvailableRoomsForDateRange(checkIn, checkOut, roomType);

    if (availableRooms.length === 0) {
      return {
        available: false,
        availableRooms: [],
        message: "No rooms are available for the selected dates.",
      };
    }

    return {
      available: true,
      availableRooms,
      message: `${availableRooms.length} ${roomType === "ac" ? "AC" : "Non-AC"} room(s) available`,
    };
  };

  const getUnavailableDatesForRoomType = (roomType: RoomType): Date[] => {
    const roomsOfType = getRoomsByType(roomType);
    if (roomsOfType.length === 0) return [];

    const unavailableDates: Date[] = [];
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 12);

    const allDates = eachDayOfInterval({ start: today, end: futureDate });

    allDates.forEach((date) => {
      // A date is unavailable if ALL rooms of this type are blocked/booked
      const allRoomsUnavailable = roomsOfType.every(
        (room) =>
          isDateBlockedForRoom(date, room.id) || isDateBookedForRoom(date, room.id)
      );
      if (allRoomsUnavailable) {
        unavailableDates.push(date);
      }
    });

    return unavailableDates;
  };

  return {
    rooms,
    loading,
    checkAvailability,
    getPriceByRoomType,
    getUnavailableDatesForRoomType,
    refetch: fetchData,
  };
}
