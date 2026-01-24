import { useState } from "react";
import { format } from "date-fns";
import { Check, X, Eye, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface BookingsTableProps {
  bookings: Booking[];
  onRefresh: () => void;
}

export function BookingsTable({ bookings, onRefresh }: BookingsTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    mobile_number: "",
    email: "",
    adults: 1,
    children: 0,
    special_requests: "",
  });

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setUpdating(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to update booking: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: `Booking ${status}` });
      onRefresh();
    }
    setUpdating(false);
  };

  const openEditDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      full_name: booking.full_name,
      mobile_number: booking.mobile_number,
      email: booking.email,
      adults: booking.adults,
      children: booking.children,
      special_requests: booking.special_requests || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedBooking) return;
    setUpdating(true);

    const { error } = await supabase
      .from("bookings")
      .update({
        full_name: editForm.full_name,
        mobile_number: editForm.mobile_number,
        email: editForm.email,
        adults: editForm.adults,
        children: editForm.children,
        special_requests: editForm.special_requests || null,
      })
      .eq("id", selectedBooking.id);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to update booking: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Booking updated" });
      setEditDialogOpen(false);
      onRefresh();
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;
    setUpdating(true);

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", selectedBooking.id);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to delete booking: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Booking deleted" });
      setDeleteDialogOpen(false);
      onRefresh();
    }
    setUpdating(false);
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No bookings found
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-xs">
                  {booking.booking_id}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.mobile_number}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">
                  {booking.room_type.replace("_", " ")}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.check_in_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.check_out_date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>₹{booking.total_amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(booking)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {booking.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateBookingStatus(booking.id, "confirmed")}
                        disabled={updating}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {(booking.status === "pending" || booking.status === "confirmed") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateBookingStatus(booking.id, "cancelled")}
                        disabled={updating}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selectedBooking?.booking_id}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Guest Name:</span>
                  <p className="font-medium">{selectedBooking.full_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile:</span>
                  <p className="font-medium">{selectedBooking.mobile_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{selectedBooking.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p>{getStatusBadge(selectedBooking.status)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Room Type:</span>
                  <p className="font-medium capitalize">
                    {selectedBooking.room_type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Guests:</span>
                  <p className="font-medium">
                    {selectedBooking.adults} Adults, {selectedBooking.children} Children
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Check-in:</span>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.check_in_date), "PPP")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Check-out:</span>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.check_out_date), "PPP")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nights:</span>
                  <p className="font-medium">{selectedBooking.total_nights}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <p className="font-medium">₹{selectedBooking.total_amount.toLocaleString()}</p>
                </div>
              </div>
              {selectedBooking.special_requests && (
                <div>
                  <span className="text-muted-foreground">Special Requests:</span>
                  <p className="font-medium">{selectedBooking.special_requests}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium">
                  {format(new Date(selectedBooking.created_at), "PPP p")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update guest information for {selectedBooking?.booking_id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_name">Full Name</Label>
              <Input
                id="edit_name"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_mobile">Mobile Number</Label>
              <Input
                id="edit_mobile"
                value={editForm.mobile_number}
                onChange={(e) =>
                  setEditForm({ ...editForm, mobile_number: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_adults">Adults</Label>
                <Input
                  id="edit_adults"
                  type="number"
                  min={1}
                  value={editForm.adults}
                  onChange={(e) =>
                    setEditForm({ ...editForm, adults: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_children">Children</Label>
                <Input
                  id="edit_children"
                  type="number"
                  min={0}
                  value={editForm.children}
                  onChange={(e) =>
                    setEditForm({ ...editForm, children: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_requests">Special Requests</Label>
              <Textarea
                id="edit_requests"
                value={editForm.special_requests}
                onChange={(e) =>
                  setEditForm({ ...editForm, special_requests: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete booking {selectedBooking?.booking_id}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updating ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
