import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { getSafeErrorMessage } from "@/lib/errorUtils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Room = Database["public"]["Tables"]["rooms"]["Row"];
type BlockedDate = Database["public"]["Tables"]["blocked_dates"]["Row"];

export function BlockedDatesManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlockedDate, setSelectedBlockedDate] = useState<BlockedDate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    
    const [roomsRes, blockedRes] = await Promise.all([
      supabase.from("rooms").select("*").eq("is_active", true),
      supabase.from("blocked_dates").select("*").order("blocked_date", { ascending: true }),
    ]);

    if (roomsRes.data) setRooms(roomsRes.data);
    if (blockedRes.data) setBlockedDates(blockedRes.data);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || "Unknown Room";
  };

  const handleAddBlockedDates = async () => {
    if (!selectedRoom || selectedDates.length === 0) {
      toast({
        title: "Error",
        description: "Please select a room and at least one date",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();
    
    const inserts = selectedDates.map((date) => ({
      room_id: selectedRoom,
      blocked_date: format(date, "yyyy-MM-dd"),
      reason: reason || null,
      blocked_by: userData.user?.id || null,
    }));

    const { error } = await supabase.from("blocked_dates").insert(inserts);

    if (error) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "blocked date"),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${selectedDates.length} date(s) blocked successfully`,
      });
      setDialogOpen(false);
      setSelectedRoom("");
      setSelectedDates([]);
      setReason("");
      fetchData();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!selectedBlockedDate) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", selectedBlockedDate.id);

    if (error) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "blocked date"),
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Date unblocked" });
      setDeleteDialogOpen(false);
      fetchData();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Blocked Dates</h3>
          <p className="text-sm text-muted-foreground">
            Manage dates when rooms are unavailable for booking
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Block Dates
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Block Dates</DialogTitle>
              <DialogDescription>
                Select a room and dates to block from bookings
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} ({room.room_type.replace("_", " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Dates to Block</Label>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
                {selectedDates.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedDates.length} date(s) selected
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Maintenance, Private booking"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBlockedDates} disabled={submitting}>
                {submitting ? "Blocking..." : "Block Dates"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {blockedDates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No blocked dates</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Blocked Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedDates.map((blocked) => (
                <TableRow key={blocked.id}>
                  <TableCell className="font-medium">
                    {blocked.room_id ? getRoomName(blocked.room_id) : "All Rooms"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(blocked.blocked_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {blocked.reason || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(blocked.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedBlockedDate(blocked);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock Date</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock{" "}
              {selectedBlockedDate &&
                format(new Date(selectedBlockedDate.blocked_date), "MMMM dd, yyyy")}
              ? This will make the date available for bookings again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {submitting ? "Unblocking..." : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
