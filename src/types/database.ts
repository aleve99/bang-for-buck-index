export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      beers: {
        Row: {
          abv: number
          brewery: string | null
          country_code: string | null
          created_at: string
          id: string
          name: string
          style: string
        }
        Insert: {
          abv: number
          brewery?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          name: string
          style: string
        }
        Update: {
          abv?: number
          brewery?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          name?: string
          style?: string
        }
        Relationships: [
          {
            foreignKeyName: "beers_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          currency_code: string
          name: string
          ppp_factor: number | null
        }
        Insert: {
          code: string
          created_at?: string
          currency_code: string
          name: string
          ppp_factor?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          currency_code?: string
          name?: string
          ppp_factor?: number | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          currency_code: string
          last_updated: string
          rate_to_usd: number
        }
        Insert: {
          currency_code: string
          last_updated?: string
          rate_to_usd: number
        }
        Update: {
          currency_code?: string
          last_updated?: string
          rate_to_usd?: number
        }
        Relationships: []
      }
      price_entries: {
        Row: {
          beer_id: string
          city: string | null
          clpa_local: number
          country_code: string
          created_at: string
          currency_code: string
          id: string
          pack_size: number
          price_local: number
          pure_alcohol_liters: number
          receipt_image_url: string | null
          venue_type: Database["public"]["Enums"]["venue_category"]
          verified: boolean
          volume_ml: number
        }
        Insert: {
          beer_id: string
          city?: string | null
          clpa_local: number
          country_code: string
          created_at?: string
          currency_code: string
          id?: string
          pack_size?: number
          price_local: number
          pure_alcohol_liters: number
          receipt_image_url?: string | null
          venue_type: Database["public"]["Enums"]["venue_category"]
          verified?: boolean
          volume_ml: number
        }
        Update: {
          beer_id?: string
          city?: string | null
          clpa_local?: number
          country_code?: string
          created_at?: string
          currency_code?: string
          id?: string
          pack_size?: number
          price_local?: number
          pure_alcohol_liters?: number
          receipt_image_url?: string | null
          venue_type?: Database["public"]["Enums"]["venue_category"]
          verified?: boolean
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_entries_beer_id_fkey"
            columns: ["beer_id"]
            isOneToOne: false
            referencedRelation: "beers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_entries_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "price_entries_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "exchange_rates"
            referencedColumns: ["currency_code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      venue_category:
        | "supermarket"
        | "convenience_store"
        | "bar_pub"
        | "restaurant"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      venue_category: [
        "supermarket",
        "convenience_store",
        "bar_pub",
        "restaurant",
      ],
    },
  },
} as const

