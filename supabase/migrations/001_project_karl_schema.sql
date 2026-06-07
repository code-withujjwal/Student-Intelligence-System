create type user_role as enum ('teacher', 'student');

create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  role user_role not null default 'student',
  display_name text not null default '',
  avatar_url text
);

alter table users enable row level security;

create policy "Users can read their own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Service can insert user on signup"
  on users for insert
  with check (auth.uid() = id);

create type question_type as enum ('MCQ', 'AR');

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  teacher_id uuid not null references users (id) on delete cascade,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  share_token text unique not null,
  time_limit_seconds int not null default 10800
);

create index if not exists idx_quizzes_teacher_id on quizzes (teacher_id);
create index if not exists idx_quizzes_share_token on quizzes (share_token);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes (id) on delete cascade,
  content text not null,
  type question_type not null default 'MCQ',
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text not null default '',
  difficulty int not null default 2 check (difficulty between 1 and 3),
  subject text not null check (subject in ('Physics', 'Chemistry', 'Math')),
  tags text[] not null default '{}',
  image_url text
);

create index if not exists idx_questions_quiz_id on questions (quiz_id);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null,
  quiz_id uuid not null references quizzes (id) on delete cascade,
  score int not null default 0,
  accuracy float not null default 0.0,
  time_taken int not null default 0,
  analytics jsonb not null default '[]'::jsonb
);

create index if not exists idx_results_user_id on results (user_id);
create index if not exists idx_results_quiz_id on results (quiz_id);

alter table quizzes enable row level security;
alter table questions enable row level security;
alter table results enable row level security;

create policy "Teachers can manage their own quizzes"
  on quizzes for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

create policy "Anyone can read quizzes by share token"
  on quizzes for select
  using (share_token is not null);

create policy "Anyone can read questions of accessible quizzes"
  on questions for select
  using (
    exists (
      select 1 from quizzes
      where quizzes.id = questions.quiz_id
        and quizzes.share_token is not null
    )
  );

create policy "Teachers can insert questions into their quizzes"
  on questions for insert
  with check (
    exists (
      select 1 from quizzes
      where quizzes.id = questions.quiz_id
        and quizzes.teacher_id = auth.uid()
    )
  );

create policy "Users can insert their own results"
  on results for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own results"
  on results for select
  using (auth.uid() = user_id);
