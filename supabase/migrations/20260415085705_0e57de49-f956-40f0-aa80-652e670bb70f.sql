
-- Agent conversation sessions
CREATE TABLE public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '新对话',
  agent_domain TEXT NOT NULL CHECK (agent_domain IN ('supply_chain', 'content', 'operation', 'design', 'general')),
  related_module TEXT,
  related_resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.agent_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.agent_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.agent_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.agent_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Agent messages within conversations
CREATE TABLE public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of own conversations"
  ON public.agent_messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.agent_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in own conversations"
  ON public.agent_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agent_conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));

-- Agent async tasks
CREATE TABLE public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  task_type TEXT NOT NULL,
  agent_domain TEXT NOT NULL CHECK (agent_domain IN ('supply_chain', 'content', 'operation', 'design', 'general')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input_params JSONB DEFAULT '{}',
  output_result JSONB,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON public.agent_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON public.agent_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Agent templates (category-specific prompts and structures)
CREATE TABLE public.agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  agent_domain TEXT NOT NULL CHECK (agent_domain IN ('supply_chain', 'content', 'operation', 'design', 'general')),
  category TEXT,
  description TEXT,
  prompt_template TEXT NOT NULL,
  output_schema JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read templates"
  ON public.agent_templates FOR SELECT
  TO authenticated
  USING (true);

-- Agent knowledge base
CREATE TABLE public.agent_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_type TEXT NOT NULL CHECK (knowledge_type IN ('category_rule', 'pricing_strategy', 'display_template', 'marketing_playbook', 'industry_benchmark')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read knowledge"
  ON public.agent_knowledge FOR SELECT
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX idx_agent_conversations_user ON public.agent_conversations(user_id);
CREATE INDEX idx_agent_messages_conversation ON public.agent_messages(conversation_id);
CREATE INDEX idx_agent_tasks_user ON public.agent_tasks(user_id);
CREATE INDEX idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX idx_agent_templates_domain ON public.agent_templates(agent_domain);
CREATE INDEX idx_agent_knowledge_type ON public.agent_knowledge(knowledge_type);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agent_conversations_updated_at
  BEFORE UPDATE ON public.agent_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at
  BEFORE UPDATE ON public.agent_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_templates_updated_at
  BEFORE UPDATE ON public.agent_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_knowledge_updated_at
  BEFORE UPDATE ON public.agent_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
