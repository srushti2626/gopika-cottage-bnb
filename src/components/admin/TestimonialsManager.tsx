import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Star } from "lucide-react";
import { getSafeErrorMessage } from "@/lib/errorUtils";

interface Testimonial {
  id: string;
  guest_name: string;
  guest_location: string | null;
  rating: number;
  review_text: string;
  review_date: string | null;
  is_active: boolean;
  display_order: number;
}

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Form state
  const [guestName, setGuestName] = useState("");
  const [guestLocation, setGuestLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error(getSafeErrorMessage(error, "fetching testimonials"));
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setGuestName("");
    setGuestLocation("");
    setRating(5);
    setReviewText("");
    setReviewDate("");
    setIsActive(true);
    setEditingTestimonial(null);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setGuestName(testimonial.guest_name);
    setGuestLocation(testimonial.guest_location || "");
    setRating(testimonial.rating);
    setReviewText(testimonial.review_text);
    setReviewDate(testimonial.review_date || "");
    setIsActive(testimonial.is_active);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName || !reviewText) {
      toast.error("Guest name and review text are required");
      return;
    }

    const testimonialData = {
      guest_name: guestName,
      guest_location: guestLocation || null,
      rating,
      review_text: reviewText,
      review_date: reviewDate || null,
      is_active: isActive,
      display_order: editingTestimonial?.display_order ?? testimonials.length,
    };

    if (editingTestimonial) {
      const { error } = await supabase
        .from("testimonials")
        .update(testimonialData)
        .eq("id", editingTestimonial.id);

      if (error) {
        toast.error(getSafeErrorMessage(error, "updating testimonial"));
        return;
      }
      toast.success("Testimonial updated successfully");
    } else {
      const { error } = await supabase
        .from("testimonials")
        .insert(testimonialData);

      if (error) {
        toast.error(getSafeErrorMessage(error, "adding testimonial"));
        return;
      }
      toast.success("Testimonial added successfully");
    }

    setDialogOpen(false);
    resetForm();
    fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(getSafeErrorMessage(error, "deleting testimonial"));
      return;
    }

    toast.success("Testimonial deleted successfully");
    fetchTestimonials();
  };

  const toggleActive = async (testimonial: Testimonial) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ is_active: !testimonial.is_active })
      .eq("id", testimonial.id);

    if (error) {
      toast.error(getSafeErrorMessage(error, "updating testimonial"));
      return;
    }

    fetchTestimonials();
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
          <h3 className="text-lg font-semibold">Guest Reviews</h3>
          <p className="text-sm text-muted-foreground">
            Manage testimonials displayed on the website
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? "Edit Review" : "Add New Review"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Guest Name *</Label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={guestLocation}
                  onChange={(e) => setGuestLocation(e.target.value)}
                  placeholder="Mumbai, India"
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={rating.toString()} onValueChange={(v) => setRating(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={r.toString()}>
                        <span className="flex items-center gap-1">
                          {r} {r === 1 ? "Star" : "Stars"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Review Text *</Label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write the guest's review..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Review Date</Label>
                <Input
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  placeholder="February 2026"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>Active (visible on site)</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTestimonial ? "Update" : "Add"} Review
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No reviews added yet. Click "Add Review" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={`${!testimonial.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                      "{testimonial.review_text}"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {testimonial.guest_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{testimonial.guest_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.guest_location}
                          {testimonial.guest_location && testimonial.review_date && " • "}
                          {testimonial.review_date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="icon" variant="ghost" onClick={() => openEditDialog(testimonial)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(testimonial.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className={`text-xs px-2 py-1 rounded ${testimonial.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {testimonial.is_active ? "Active" : "Hidden"}
                  </span>
                  <Switch
                    checked={testimonial.is_active}
                    onCheckedChange={() => toggleActive(testimonial)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}