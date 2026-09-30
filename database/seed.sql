-- Seed data for the private class memory app.

insert into public.classes (id, name, school_name, academic_year, join_code, created_by, status)
values (
  '11111111-1111-4111-8111-111111111111',
  '12-A',
  'Northfield Academy',
  2026,
  '7K9A-PQ2T',
  '22222222-2222-4222-8222-222222222222',
  'active'
)
on conflict do nothing;

insert into public.daily_prompts (id, prompt_text, prompt_date)
values
  ('33333333-3333-4333-8333-333333333333', 'Show us your current view.', current_date),
  ('33333333-3333-4333-8333-333333333334', 'What made you smile today?', current_date + 1),
  ('33333333-3333-4333-8333-333333333335', 'What is on your desk?', current_date + 2)
on conflict (prompt_date) do nothing;
