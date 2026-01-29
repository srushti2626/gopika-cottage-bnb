import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, RefreshCw, Upload, X, Image as ImageIcon } from "lucide-react";

type RoomType = "ac" | "non_ac";

interface Room {
  id: string;
  name: string;
  room_type: RoomType;
  price_per_night: number;
  max_guests: number;
  description: string | null;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface RoomFormData {
  name: string;
  room_type: RoomType;
  price_per_night: number;
  max_guests: number;
  description: string;
  is_active: boolean;
}

const initialFormData: RoomFormData = {
  name: "",
  room_type: "ac",
  price_per_night: 3000,
  max_guests: 4,
  description: "",
  is_active: true,
};

export function RoomsManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch rooms");
    } else {
      setRooms((data as Room[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateDialog = () => {
    setEditingRoom(null);
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      room_type: room.room_type,
      price_per_night: room.price_per_night,
      max_guests: room.max_guests,
      description: room.description || "",
      is_active: room.is_active,
    });
    setImageFile(null);
    setImagePreview(room.image_url);
    setIsDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (roomId: string): Promise<string | null> => {
    if (!imageFile) return editingRoom?.image_url || null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${roomId}.${fileExt}`;
      const filePath = `rooms/${fileName}`;

      // Delete old image if exists
      if (editingRoom?.image_url) {
        const oldPath = editingRoom.image_url.split("/").slice(-2).join("/");
        await supabase.storage.from("room-images").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(filePath, imageFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("room-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Room name is required");
      return;
    }

    setSaving(true);

    if (editingRoom) {
      // Upload image first if changed
      const imageUrl = await uploadImage(editingRoom.id);

      // Update existing room
      const { error } = await supabase
        .from("rooms")
        .update({
          name: formData.name,
          room_type: formData.room_type,
          price_per_night: formData.price_per_night,
          max_guests: formData.max_guests,
          description: formData.description || null,
          is_active: formData.is_active,
          image_url: imageUrl,
        })
        .eq("id", editingRoom.id);

      if (error) {
        toast.error("Failed to update room");
      } else {
        toast.success("Room updated successfully");
        setIsDialogOpen(false);
        fetchRooms();
      }
    } else {
      // Create new room first to get ID
      const { data: newRoom, error: createError } = await supabase
        .from("rooms")
        .insert({
          name: formData.name,
          room_type: formData.room_type,
          price_per_night: formData.price_per_night,
          max_guests: formData.max_guests,
          description: formData.description || null,
          is_active: formData.is_active,
        })
        .select()
        .single();

      if (createError || !newRoom) {
        toast.error("Failed to create room");
        setSaving(false);
        return;
      }

      // Upload image if selected
      if (imageFile) {
        const imageUrl = await uploadImage(newRoom.id);
        if (imageUrl) {
          await supabase
            .from("rooms")
            .update({ image_url: imageUrl })
            .eq("id", newRoom.id);
        }
      }

      toast.success("Room created successfully");
      setIsDialogOpen(false);
      fetchRooms();
    }

    setSaving(false);
  };

  const toggleRoomStatus = async (room: Room) => {
    const { error } = await supabase
      .from("rooms")
      .update({ is_active: !room.is_active })
      .eq("id", room.id);

    if (error) {
      toast.error("Failed to update room status");
    } else {
      toast.success(room.is_active ? "Room disabled" : "Room enabled");
      fetchRooms();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Room Management</CardTitle>
              <CardDescription>
                Create, edit, and manage room availability
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={fetchRooms}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Room
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No rooms found. Create your first room to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Room Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price/Night</TableHead>
                    <TableHead>Max Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        {room.image_url ? (
                          <img
                            src={room.image_url}
                            alt={room.name}
                            className="w-16 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {room.room_type === "ac" ? "AC" : "Non-AC"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatPrice(room.price_per_night)}</TableCell>
                      <TableCell>{room.max_guests} guests</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={room.is_active}
                            onCheckedChange={() => toggleRoomStatus(room)}
                          />
                          <span
                            className={
                              room.is_active
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }
                          >
                            {room.is_active ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Edit Room" : "Create New Room"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? "Update the room details below"
                : "Fill in the details to create a new room"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Image Upload */}
            <div className="grid gap-2">
              <Label>Room Image</Label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Room preview"
                      className="w-full max-w-[200px] h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload room image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5MB, JPG/PNG/WebP
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Room Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Beachfront Suite"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="room_type">Room Type</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, room_type: v as RoomType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ac">AC</SelectItem>
                    <SelectItem value="non_ac">Non-AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max_guests">Max Guests</Label>
                <Input
                  id="max_guests"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.max_guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_guests: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price per Night (₹)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={100}
                value={formData.price_per_night}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_per_night: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the room amenities and features..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Room is available for booking</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving || uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || uploading}>
              {saving || uploading
                ? "Saving..."
                : editingRoom
                ? "Update Room"
                : "Create Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
