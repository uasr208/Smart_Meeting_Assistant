export interface Database {
  public: {
    Tables: {
      transcripts: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          user_id?: string;
        };
      };
      action_items: {
        Row: {
          id: string;
          transcript_id: string;
          task: string;
          owner: string | null;
          due_date: string | null;
          status: string;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          transcript_id: string;
          task: string;
          owner?: string | null;
          due_date?: string | null;
          status?: string;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          transcript_id?: string;
          task?: string;
          owner?: string | null;
          due_date?: string | null;
          status?: string;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
}

export type Transcript = Database['public']['Tables']['transcripts']['Row'];
export type ActionItem = Database['public']['Tables']['action_items']['Row'];
