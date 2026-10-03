-- Guarantees that two orders can never share an order_number.
--
-- Why this is needed: createOrder() draws the number at random from a pool of
-- 9000 values. The birthday paradox makes a duplicate likely as the order book
-- grows (~5% at 31 orders, ~42% at 100, ~90% at 200). A duplicate order_number
-- makes getOrderById() return another customer's order and makes
-- hasEmailBeenSent() suppress the confirmation email.
--
-- The application-level retry in createOrder() handles the common case; this
-- index is what actually makes the guarantee hold, because it also covers the
-- race where two concurrent checkouts both pass the existence check.
--
-- Safe to re-run. Run it in the Supabase SQL editor.

-- 1. Refuse to proceed while duplicates exist: the index would fail anyway, and
--    failing here is clearer than a cryptic CREATE UNIQUE INDEX error.
do $$
declare
  dup_count integer;
begin
  select count(*) into dup_count
  from (
    select order_number
    from public.orders
    where order_number is not null
    group by order_number
    having count(*) > 1
  ) d;

  if dup_count > 0 then
    raise exception 'ABANDON: % order_number en double. Résoudre avant de créer l index.', dup_count;
  end if;

  raise notice 'OK: aucun doublon détecté.';
end $$;

-- 2. Enforce uniqueness on order_number.
create unique index if not exists orders_order_number_key
  on public.orders (order_number);

-- 3. Reject empty order numbers too: tracking relies on the value being present.
alter table public.orders
  alter column order_number set not null;