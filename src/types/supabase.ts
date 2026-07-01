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
      attendance: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          person_id: string
          session_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          person_id: string
          session_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          person_id?: string
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          session_date: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          session_date: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          title?: string
        }
        Relationships: []
      }
      exposition_notes: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          exposition_date: string
          highlights: string | null
          id: string
          improvements: string | null
          speaker: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          exposition_date: string
          highlights?: string | null
          id?: string
          improvements?: string | null
          speaker?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          exposition_date?: string
          highlights?: string | null
          id?: string
          improvements?: string | null
          speaker?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      formation_lessons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          module_id: string
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          module_id: string
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          module_id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "formation_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "formation_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      formation_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      leader_ministries: {
        Row: {
          assigned_at: string
          id: string
          ministry_id: string
          person_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          ministry_id: string
          person_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          ministry_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leader_ministries_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leader_ministries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_sessions: {
        Row: {
          agreements: string | null
          created_at: string
          created_by: string | null
          id: string
          leader_id: string
          next_session_date: string | null
          session_date: string
          summary: string | null
        }
        Insert: {
          agreements?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          leader_id: string
          next_session_date?: string | null
          session_date: string
          summary?: string | null
        }
        Update: {
          agreements?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          leader_id?: string
          next_session_date?: string | null
          session_date?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leader_sessions_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          address: string | null
          birth_date: string | null
          conversion_date: string | null
          created_at: string
          email: string | null
          first_name: string
          holy_spirit_baptism_date: string | null
          holy_spirit_experience: string
          id: string
          is_active: boolean
          last_name: string
          marital_status: string | null
          notes: string | null
          person_type: string
          phone: string | null
          updated_at: string
          water_baptism_date: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          conversion_date?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          holy_spirit_baptism_date?: string | null
          holy_spirit_experience?: string
          id?: string
          is_active?: boolean
          last_name: string
          marital_status?: string | null
          notes?: string | null
          person_type: string
          phone?: string | null
          updated_at?: string
          water_baptism_date?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          conversion_date?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          holy_spirit_baptism_date?: string | null
          holy_spirit_experience?: string
          id?: string
          is_active?: boolean
          last_name?: string
          marital_status?: string | null
          notes?: string | null
          person_type?: string
          phone?: string | null
          updated_at?: string
          water_baptism_date?: string | null
        }
        Relationships: []
      }
      person_lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          evaluated_by: string | null
          id: string
          lesson_id: string
          person_id: string
          score: number | null
          score_notes: string | null
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          evaluated_by?: string | null
          id?: string
          lesson_id: string
          person_id: string
          score?: number | null
          score_notes?: string | null
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          evaluated_by?: string | null
          id?: string
          lesson_id?: string
          person_id?: string
          score?: number | null
          score_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "formation_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_lesson_progress_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          full_name: string
          id: string
          role: string
        }
        Insert: {
          full_name: string
          id: string
          role?: string
        }
        Update: {
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          ministry_id: string | null
          related_person_id: string | null
          result_notes: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          ministry_id?: string | null
          related_person_id?: string | null
          result_notes?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          ministry_id?: string | null
          related_person_id?: string | null
          result_notes?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_person_id_fkey"
            columns: ["related_person_id"]
            isOneToOne: false
            referencedRelation: "people"
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
