import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CalendarIcon,
  Users,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Baby,
  User,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

type RoomType = Database["public"]["Enums"]["room_type"];

const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name must be less than 100 characters"),
  mobileNumber: z.string().trim().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  adults: z.number().min(1, "At least 1 adult is required").max(8, "Maximum 8 adults allowed"),
  children: z.number().min(0, "Children cannot be negative").max(8, "Maximum 8 children allowed"),
  specialRequests: z.string().max(500, "Special requests must be less than 500 characters").optional(),
});

const BookingSection = () => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [roomType, setRoomType] = useState<RoomType>("ac");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { loading, checkAvailability, getPriceByRoomType, getUnavailableDatesForRoomType, rooms } =
    useRoomAvailability();

  const availability = checkAvailability(checkIn, checkOut, roomType);
  const pricePerNight = getPriceByRoomType(roomType);
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * pricePerNight;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  const totalGuests = adults + children;

  const unavailableDates = getUnavailableDatesForRoomType(roomType);

  const validateForm = (): boolean => {
    try {
      bookingSchema.parse({
        fullName,
        mobileNumber,
        email,
        adults,
        children,
        specialRequests,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: "Missing Dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    if (!availability.available) {
      toast({
        title: "Not Available",
        description: availability.message,
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await supabase.functions.invoke("create-booking", {
        body: {
          roomType,
          checkInDate: format(checkIn, "yyyy-MM-dd"),
          checkOutDate: format(checkOut, "yyyy-MM-dd"),
          fullName,
          mobileNumber,
          email,
          adults,
          children,
          specialRequests: specialRequests.trim() ? specialRequests.trim() : null,
        },
      });

      if (error) {
        toast({
          title: "Booking Failed",
          description: error.message || "Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Booking Request Submitted!",
        description: `Booking ID: ${data?.bookingId ?? "(pending)"}. Total: ₹${total.toLocaleString()}`,
      });

      // Reset form (keep roomType)
      setCheckIn(undefined);
      setCheckOut(undefined);
      setFullName("");
      setMobileNumber("");
      setEmail("");
      setAdults(2);
      setChildren(0);
      setSpecialRequests("");
      setErrors({});
    } catch (e) {
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    checkIn &&
    checkOut &&
    availability.available &&
    fullName.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(mobileNumber) &&
    email.includes("@") &&
    adults >= 1;

  return (
    <section id="booking" className="section-padding bg-background">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Book Your Stay
          </span>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            Reserve Your <span className="text-primary">Escape</span>
          </h2>
          <p className="subtitle">
            Fill in your details and select your dates. Instant confirmation and
            flexible cancellation.
          </p>
        </div>

        {/* Booking Card */}
        <div className="max-w-5xl mx-auto">
          <div className="card-cottage p-6 lg:p-10">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading availability...</span>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Guest Details */}
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Guest Details
                  </h3>

                  {/* Full Name */}
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={cn("mt-1.5", errors.fullName && "border-destructive")}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <Label htmlFor="mobile" className="text-sm font-medium">
                      Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="mobile"
                      placeholder="10-digit mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className={cn("mt-1.5", errors.mobileNumber && "border-destructive")}
                    />
                    {errors.mobileNumber && (
                      <p className="text-xs text-destructive mt-1">{errors.mobileNumber}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn("mt-1.5", errors.email && "border-destructive")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Guests Count */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Adults <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                        >
                          -
                        </Button>
                        <div className="flex items-center justify-center gap-1 min-w-[60px]">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{adults}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setAdults(Math.min(8, adults + 1))}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Children</Label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                        >
                          -
                        </Button>
                        <div className="flex items-center justify-center gap-1 min-w-[60px]">
                          <Baby className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{children}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setChildren(Math.min(8, children + 1))}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="requests" className="text-sm font-medium">
                      Special Requests (optional)
                    </Label>
                    <Textarea
                      id="requests"
                      placeholder="Any special requirements..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="mt-1.5 min-h-[80px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {specialRequests.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Date & Room Selection */}
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Room & Dates
                  </h3>

                  {/* Room Type */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Room Type <span className="text-destructive">*</span>
                    </Label>
                    <RadioGroup
                      value={roomType}
                      onValueChange={(value) => setRoomType(value as RoomType)}
                      className="space-y-3"
                    >
                      {/* AC Room Option */}
                      {(() => {
                        const acRoom = rooms.find((r) => r.room_type === "ac");
                        const acPrice = getPriceByRoomType("ac");
                        return (
                          <div
                            className={cn(
                              "flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                              roomType === "ac"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => setRoomType("ac")}
                          >
                            <RadioGroupItem value="ac" id="ac" className="mt-1" />
                            <Label htmlFor="ac" className="cursor-pointer flex-1">
                              <div className="flex gap-3">
                                {acRoom?.image_url ? (
                                  <img
                                    src={acRoom.image_url}
                                    alt="AC Room"
                                    className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-20 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs text-muted-foreground">AC</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-semibold">AC Room</span>
                                      <p className="text-xs text-muted-foreground">
                                        {acRoom?.description || "Air-conditioned with double bed"}
                                      </p>
                                    </div>
                                    <span className="font-semibold text-primary whitespace-nowrap ml-2">
                                      ₹{acPrice.toLocaleString()}/night
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        );
                      })()}
                      
                      {/* Non-AC Room Option */}
                      {(() => {
                        const nonAcRoom = rooms.find((r) => r.room_type === "non_ac");
                        const nonAcPrice = getPriceByRoomType("non_ac");
                        return (
                          <div
                            className={cn(
                              "flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                              roomType === "non_ac"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => setRoomType("non_ac")}
                          >
                            <RadioGroupItem value="non_ac" id="non_ac" className="mt-1" />
                            <Label htmlFor="non_ac" className="cursor-pointer flex-1">
                              <div className="flex gap-3">
                                {nonAcRoom?.image_url ? (
                                  <img
                                    src={nonAcRoom.image_url}
                                    alt="Non-AC Room"
                                    className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-20 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs text-muted-foreground">Non-AC</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-semibold">Non-AC Room</span>
                                      <p className="text-xs text-muted-foreground">
                                        {nonAcRoom?.description || "Ventilated room with double bed"}
                                      </p>
                                    </div>
                                    <span className="font-semibold text-primary whitespace-nowrap ml-2">
                                      ₹{nonAcPrice.toLocaleString()}/night
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        );
                      })()}
                    </RadioGroup>
                  </div>

                  {/* Check-in Date */}
                  <div>
                    <Label className="text-sm font-medium">
                      Check-in Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11 mt-1.5",
                            !checkIn && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "PPP") : "Select check-in date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={(date) => {
                            setCheckIn(date);
                            if (checkOut && date && checkOut <= date) {
                              setCheckOut(undefined);
                            }
                          }}
                          disabled={(date) =>
                            date < new Date() ||
                            unavailableDates.some(
                              (d) => d.toDateString() === date.toDateString()
                            )
                          }
                          modifiers={{
                            fullyBooked: unavailableDates,
                          }}
                          modifiersClassNames={{
                            fullyBooked: "bg-destructive/20 text-destructive line-through",
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <Label className="text-sm font-medium">
                      Check-out Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11 mt-1.5",
                            !checkOut && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, "PPP") : "Select check-out date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) =>
                            date <= (checkIn || new Date()) ||
                            unavailableDates.some(
                              (d) => d.toDateString() === date.toDateString()
                            )
                          }
                          modifiers={{
                            fullyBooked: unavailableDates,
                          }}
                          modifiersClassNames={{
                            fullyBooked: "bg-destructive/20 text-destructive line-through",
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Availability Status */}
                  {checkIn && checkOut && (
                    <div
                      className={cn(
                        "p-4 rounded-lg flex items-start gap-3",
                        availability.available
                          ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
                          : "bg-destructive/10 border border-destructive/30"
                      )}
                    >
                      {availability.available ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={cn(
                            "font-medium text-sm",
                            availability.available
                              ? "text-green-700 dark:text-green-400"
                              : "text-destructive"
                          )}
                        >
                          {availability.message}
                        </p>
                        {!availability.available && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Please try different dates or room type.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="bg-secondary/50 rounded-xl p-6 h-fit">
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    Price Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Room Type</span>
                      <span className="font-medium">
                        {roomType === "ac" ? "AC Room" : "Non-AC Room"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Guests</span>
                      <span className="font-medium">
                        {adults} Adult{adults !== 1 ? "s" : ""}
                        {children > 0 && `, ${children} Child${children !== 1 ? "ren" : ""}`}
                      </span>
                    </div>
                    <div className="w-full h-px bg-border my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        ₹{pricePerNight.toLocaleString()} × {nights || 0} night
                        {nights !== 1 ? "s" : ""}
                      </span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span className="font-medium">₹{tax.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-px bg-border my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">Total</span>
                      <span className="text-2xl font-heading font-semibold text-primary flex items-center">
                        <IndianRupee className="w-5 h-5" />
                        {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    size="xl"
                    className="w-full mt-8"
                    onClick={handleBooking}
                    disabled={!isFormValid || submitting}
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : !availability.available && checkIn && checkOut ? (
                      "Not Available"
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Free cancellation up to 48 hours before check-in
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
