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
      address: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          created_at: string
          district_code: string
          household_id: string
          id: string
          is_current: boolean
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          created_at?: string
          district_code: string
          household_id: string
          id?: string
          is_current?: boolean
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          created_at?: string
          district_code?: string
          household_id?: string
          id?: string
          is_current?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "address_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
        ]
      }
      app_user_profile: {
        Row: {
          created_at: string | null
          district_code: string | null
          full_name: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          district_code?: string | null
          full_name: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          district_code?: string | null
          full_name?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      audit_event: {
        Row: {
          action: string
          actor_role: string | null
          actor_user_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata_json: Json | null
          occurred_at: string
          reason: string | null
        }
        Insert: {
          action: string
          actor_role?: string | null
          actor_user_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata_json?: Json | null
          occurred_at?: string
          reason?: string | null
        }
        Update: {
          action?: string
          actor_role?: string | null
          actor_user_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata_json?: Json | null
          occurred_at?: string
          reason?: string | null
        }
        Relationships: []
      }
      contact_point: {
        Row: {
          contact_type: string
          contact_value: string
          created_at: string
          id: string
          is_primary: boolean
          person_id: string
        }
        Insert: {
          contact_type: string
          contact_value: string
          created_at?: string
          id?: string
          is_primary?: boolean
          person_id: string
        }
        Update: {
          contact_type?: string
          contact_value?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_point_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_document: {
        Row: {
          case_id: string
          document_type: string
          file_name: string
          file_path: string
          generated_at: string
          generated_by: string | null
          id: string
        }
        Insert: {
          case_id: string
          document_type: string
          file_name: string
          file_path: string
          generated_at?: string
          generated_by?: string | null
          id?: string
        }
        Update: {
          case_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          generated_at?: string
          generated_by?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_document_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "subsidy_case"
            referencedColumns: ["id"]
          },
        ]
      }
      household: {
        Row: {
          created_at: string
          district_code: string
          household_size: number
          id: string
          primary_person_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          district_code: string
          household_size?: number
          id?: string
          primary_person_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          district_code?: string
          household_size?: number
          id?: string
          primary_person_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_primary_person_id_fkey"
            columns: ["primary_person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      household_member: {
        Row: {
          created_at: string
          household_id: string
          id: string
          person_id: string
          relationship: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          person_id: string
          relationship: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          person_id?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_member_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_member_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      housing_registration: {
        Row: {
          applicant_person_id: string
          assigned_officer_id: string | null
          created_at: string
          current_status: string
          district_code: string
          household_id: string
          housing_type_preference: string | null
          id: string
          reference_number: string
          registration_date: string
          updated_at: string
          urgency_score: number | null
          waiting_list_position: number | null
        }
        Insert: {
          applicant_person_id: string
          assigned_officer_id?: string | null
          created_at?: string
          current_status?: string
          district_code: string
          household_id: string
          housing_type_preference?: string | null
          id?: string
          reference_number: string
          registration_date?: string
          updated_at?: string
          urgency_score?: number | null
          waiting_list_position?: number | null
        }
        Update: {
          applicant_person_id?: string
          assigned_officer_id?: string | null
          created_at?: string
          current_status?: string
          district_code?: string
          household_id?: string
          housing_type_preference?: string | null
          id?: string
          reference_number?: string
          registration_date?: string
          updated_at?: string
          urgency_score?: number | null
          waiting_list_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "housing_registration_applicant_person_id_fkey"
            columns: ["applicant_person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housing_registration_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
        ]
      }
      housing_registration_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_status: string | null
          id: string
          reason: string | null
          registration_id: string
          to_status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_status?: string | null
          id?: string
          reason?: string | null
          registration_id: string
          to_status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_status?: string | null
          id?: string
          reason?: string | null
          registration_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "housing_registration_status_history_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "housing_registration"
            referencedColumns: ["id"]
          },
        ]
      }
      housing_urgency: {
        Row: {
          assessed_by: string | null
          assessment_date: string
          id: string
          justification: string | null
          registration_id: string
          supporting_document_path: string | null
          urgency_category: string
          urgency_points: number
        }
        Insert: {
          assessed_by?: string | null
          assessment_date?: string
          id?: string
          justification?: string | null
          registration_id: string
          supporting_document_path?: string | null
          urgency_category: string
          urgency_points: number
        }
        Update: {
          assessed_by?: string | null
          assessment_date?: string
          id?: string
          justification?: string | null
          registration_id?: string
          supporting_document_path?: string | null
          urgency_category?: string
          urgency_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "housing_urgency_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "housing_registration"
            referencedColumns: ["id"]
          },
        ]
      }
      person: {
        Row: {
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          national_id: string
          nationality: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          national_id: string
          nationality?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          national_id?: string
          nationality?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_status_access: {
        Row: {
          access_token_hash: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          last_accessed_at: string | null
          reference_number: string
        }
        Insert: {
          access_token_hash: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          last_accessed_at?: string | null
          reference_number: string
        }
        Update: {
          access_token_hash?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          last_accessed_at?: string | null
          reference_number?: string
        }
        Relationships: []
      }
      social_report: {
        Row: {
          case_id: string
          created_at: string
          created_by: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          is_finalized: boolean
          report_json: Json
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          is_finalized?: boolean
          report_json?: Json
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          is_finalized?: boolean
          report_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_report_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "subsidy_case"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidy_case: {
        Row: {
          applicant_person_id: string
          approved_amount: number | null
          case_number: string
          created_at: string
          created_by: string | null
          district_code: string
          household_id: string
          id: string
          rejection_reason: string | null
          requested_amount: number | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_person_id: string
          approved_amount?: number | null
          case_number: string
          created_at?: string
          created_by?: string | null
          district_code: string
          household_id: string
          id?: string
          rejection_reason?: string | null
          requested_amount?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_person_id?: string
          approved_amount?: number | null
          case_number?: string
          created_at?: string
          created_by?: string | null
          district_code?: string
          household_id?: string
          id?: string
          rejection_reason?: string | null
          requested_amount?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_case_applicant_person_id_fkey"
            columns: ["applicant_person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subsidy_case_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidy_case_status_history: {
        Row: {
          case_id: string
          changed_at: string
          changed_by: string | null
          from_status: string | null
          id: string
          reason: string | null
          to_status: string
        }
        Insert: {
          case_id: string
          changed_at?: string
          changed_by?: string | null
          from_status?: string | null
          id?: string
          reason?: string | null
          to_status: string
        }
        Update: {
          case_id?: string
          changed_at?: string
          changed_by?: string | null
          from_status?: string | null
          id?: string
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_case_status_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "subsidy_case"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidy_document_requirement: {
        Row: {
          created_at: string
          description: string | null
          document_code: string
          document_name: string
          id: string
          is_mandatory: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_code: string
          document_name: string
          id?: string
          is_mandatory?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          document_code?: string
          document_name?: string
          id?: string
          is_mandatory?: boolean
        }
        Relationships: []
      }
      subsidy_document_upload: {
        Row: {
          case_id: string
          file_name: string
          file_path: string
          id: string
          is_verified: boolean
          requirement_id: string
          uploaded_at: string
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          case_id: string
          file_name: string
          file_path: string
          id?: string
          is_verified?: boolean
          requirement_id: string
          uploaded_at?: string
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          case_id?: string
          file_name?: string
          file_path?: string
          id?: string
          is_verified?: boolean
          requirement_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_document_upload_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "subsidy_case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subsidy_document_upload_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "subsidy_document_requirement"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_report: {
        Row: {
          case_id: string
          created_at: string
          created_by: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          is_finalized: boolean
          report_json: Json
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          is_finalized?: boolean
          report_json?: Json
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          is_finalized?: boolean
          report_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_report_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "subsidy_case"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
