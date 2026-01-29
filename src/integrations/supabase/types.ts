export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blocked_dates: {
        Row: {
          blocked_by: string | null
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
          room_id: string | null
        }
        Insert: {
          blocked_by?: string | null
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
          room_id?: string | null
        }
        Update: {
          blocked_by?: string | null
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          adults: number
          booking_id: string
          check_in_date: string
          check_out_date: string
          children: number
          created_at: string
          email: string
          full_name: string
          id: string
          mobile_number: string
          payment_status: string | null
          room_id: string
          room_type: Database["public"]["Enums"]["room_type"]
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id: string | null
          total_amount: number
          total_nights: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          adults?: number
          booking_id: string
          check_in_date: string
          check_out_date: string
          children?: number
          created_at?: string
          email: string
          full_name: string
          id?: string
          mobile_number: string
          payment_status?: string | null
          room_id: string
          room_type: Database["public"]["Enums"]["room_type"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id?: string | null
          total_amount: number
          total_nights: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          adults?: number
          booking_id?: string
          check_in_date?: string
          check_out_date?: string
          children?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          mobile_number?: string
          payment_status?: string | null
          room_id?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id?: string | null
          total_amount?: number
          total_nights?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          booking_id: string
          check_in_date: string
          check_out_date: string
          created_at: string
          email_sent: boolean | null
          guest_email: string
          guest_mobile: string
          guest_name: string
          id: string
          invoice_number: string
          pdf_url: string | null
          room_price_per_night: number
          room_type: Database["public"]["Enums"]["room_type"]
          subtotal: number
          tax_amount: number
          total_amount: number
          total_nights: number
        }
        Insert: {
          booking_id: string
          check_in_date: string
          check_out_date: string
          created_at?: string
          email_sent?: boolean | null
          guest_email: string
          guest_mobile: string
          guest_name: string
          id?: string
          invoice_number: string
          pdf_url?: string | null
          room_price_per_night: number
          room_type: Database["public"]["Enums"]["room_type"]
          subtotal: number
          tax_amount?: number
          total_amount: number
          total_nights: number
        }
        Update: {
          booking_id?: string
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          email_sent?: boolean | null
          guest_email?: string
          guest_mobile?: string
          guest_name?: string
          id?: string
          invoice_number?: string
          pdf_url?: string | null
          room_price_per_night?: number
          room_type?: Database["public"]["Enums"]["room_type"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          total_nights?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mobile_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          max_guests: number
          name: string
          price_per_night: number
          room_type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_guests?: number
          name: string
          price_per_night: number
          room_type: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_guests?: number
          name?: string
          price_per_night?: number
          room_type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      blocked_dates_public: {
        Row: {
          blocked_date: string | null
          id: string | null
          room_id: string | null
        }
        Insert: {
          blocked_date?: string | null
          id?: string | null
          room_id?: string | null
        }
        Update: {
          blocked_date?: string | null
          id?: string | null
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_availability: {
        Row: {
          check_in_date: string | null
          check_out_date: string | null
          room_id: string | null
        }
        Insert: {
          check_in_date?: string | null
          check_out_date?: string | null
          room_id?: string | null
        }
        Update: {
          check_in_date?: string | null
          check_out_date?: string | null
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_blocked_dates: {
        Args: never
        Returns: {
          blocked_date: string
          id: string
          room_id: string
        }[]
      }
      get_booking_availability: {
        Args: never
        Returns: {
          check_in_date: string
          check_out_date: string
          room_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      room_type: "ac" | "non_ac"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      room_type: ["ac", "non_ac"],
    },
  },
} as const
