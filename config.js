window.LESSON_CONFIG = {
  url: 'https://czgcwbblsdncnnakbsvq.supabase.co/rest/v1/',
  key: 'sb_publishable_6hU8aWWLD_n8Vi4D_P6UhQ_YD3X73nn'
};

// Para activar o site público com dados partilhados:
// 1. Cria um projeto no Supabase
// 2. Cria a tabela lessons com colunas:
//    id uuid primary key default gen_random_uuid()
//    number text
//    summary text
//    comment text
//    created_at timestamptz default now()
// 3. Coloca aqui o URL e a anon key do projeto
// 4. O site passa a partilhar as aulas para qualquer pessoa ver no mesmo link
