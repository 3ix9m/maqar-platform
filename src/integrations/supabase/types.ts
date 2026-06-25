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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      housing_requests: {
        Row: {
          area: string | null
          budget: number | null
          created_at: string
          id: string
          notes: string | null
          status: string
          student_id: string
          type: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          budget?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          student_id: string
          type: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          budget?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      landlord_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          landlord_id: string
          rating: number
          student_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          landlord_id: string
          rating: number
          student_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          landlord_id?: string
          rating?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landlord_ratings_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
        ]
      }
      landlords: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          area: string | null
          created_at: string
          id: string
          max_price: number | null
          student_id: string
          type: string | null
          verified_only: boolean
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: string
          max_price?: number | null
          student_id: string
          type?: string | null
          verified_only?: boolean
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: string
          max_price?: number | null
          student_id?: string
          type?: string | null
          verified_only?: boolean
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: string | null
          badge: string | null
          baths: number
          cover_image: string | null
          created_at: string
          description: string | null
          distance: string | null
          id: string
          landlord_id: string
          latitude: number | null
          longitude: number | null
          previously_rented: boolean
          price: number
          rooms: number
          status: string
          title: string
          type: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          area?: string | null
          badge?: string | null
          baths?: number
          cover_image?: string | null
          created_at?: string
          description?: string | null
          distance?: string | null
          id?: string
          landlord_id: string
          latitude?: number | null
          longitude?: number | null
          previously_rented?: boolean
          price: number
          rooms?: number
          status?: string
          title: string
          type: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          area?: string | null
          badge?: string | null
          baths?: number
          cover_image?: string | null
          created_at?: string
          description?: string | null
          distance?: string | null
          id?: string
          landlord_id?: string
          latitude?: number | null
          longitude?: number | null
          previously_rented?: boolean
          price?: number
          rooms?: number
          status?: string
          title?: string
          type?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "properties_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          property_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_ratings: {
        Row: {
          cleanliness: number | null
          comment: string | null
          created_at: string
          furniture: number | null
          id: string
          internet: number | null
          property_id: string
          quietness: number | null
          student_id: string
        }
        Insert: {
          cleanliness?: number | null
          comment?: string | null
          created_at?: string
          furniture?: number | null
          id?: string
          internet?: number | null
          property_id: string
          quietness?: number | null
          student_id: string
        }
        Update: {
          cleanliness?: number | null
          comment?: string | null
          created_at?: string
          furniture?: number | null
          id?: string
          internet?: number | null
          property_id?: string
          quietness?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_ratings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          landlord_id: string | null
          notes: string | null
          property_id: string
          start_date: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          landlord_id?: string | null
          notes?: string | null
          property_id: string
          start_date?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          landlord_id?: string | null
          notes?: string | null
          property_id?: string
          start_date?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "landlords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          university: string | null
          updated_at: string
          verified_renter: boolean
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          university?: string | null
          updated_at?: string
          verified_renter?: boolean
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          university?: string | null
          updated_at?: string
          verified_renter?: boolean
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
          role: Database["public"]["Enums"]["app_role"]
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
      viewing_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          preferred_date: string | null
          preferred_time: string | null
          property_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          property_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          property_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      student_rented_property: {
        Args: { _property_id: string; _student_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student" | "landlord"
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
      app_role: ["admin", "student", "landlord"],
    },
  },
} as const
