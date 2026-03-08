
-- Remove old seeded services
DELETE FROM public.addon_services;

-- Insert food menu items + city tour
INSERT INTO public.addon_services (name, description, price, price_type, display_order) VALUES
  -- Breakfast Items
  ('Upma', 'Traditional semolina breakfast', 50, 'flat', 1),
  ('Kanda Poha', 'Flattened rice with onions', 50, 'flat', 2),
  ('Sheera', 'Sweet semolina dessert', 50, 'flat', 3),
  ('Thalipeeth (2 pcs)', 'Multi-grain flatbread', 75, 'flat', 4),
  ('Kanda Bhaji', 'Crispy onion fritters', 80, 'flat', 5),
  ('Batata Bhaji', 'Spiced potato dish', 60, 'flat', 6),
  ('Misal Pav', 'Spicy sprout curry with bread', 75, 'flat', 7),
  ('Ghavne & Chutney', 'Rice crepes with chutney', 75, 'flat', 8),
  ('Sabudana Khichdi', 'Tapioca pearl stir-fry', 75, 'flat', 9),
  ('Bread Butter', 'Classic bread with butter', 75, 'flat', 10),
  ('Jam Bread', 'Bread with jam', 80, 'flat', 11),
  ('Omelette Pav', 'Egg omelette with bread', 80, 'flat', 12),
  ('Bhurji Pav', 'Scrambled egg with bread', 80, 'flat', 13),
  ('Boiled Egg', 'Simple boiled egg', 20, 'flat', 14),
  -- Veg Thali & Meals
  ('Veg Thali', 'Complete vegetarian thali', 250, 'flat', 15),
  ('Dal Khichdi', 'Lentil rice comfort meal', 150, 'flat', 16),
  ('Zunka Bhakri', 'Chickpea flour curry with millet bread', 120, 'flat', 17),
  ('Pitla Bhakri', 'Gram flour curry with millet bread', 150, 'flat', 18),
  -- Non-Veg Thali & Dishes
  ('Chicken Thali', 'Full chicken thali meal', 350, 'flat', 19),
  ('Gavran Chicken Thali', 'Country chicken thali', 400, 'flat', 20),
  ('Kombdi Vade', 'Chicken with fried bread', 350, 'flat', 21),
  ('Gavran Kombdi Vade', 'Country chicken with fried bread', 450, 'flat', 22),
  ('Mutton Thali', 'Full mutton thali meal', 450, 'flat', 23),
  ('Mutton Vade', 'Mutton with fried bread', 475, 'flat', 24),
  ('Fish Thali', 'Fresh fish thali meal', 475, 'flat', 25),
  ('Anda Thali', 'Egg thali meal', 250, 'flat', 26),
  -- City Tour
  ('City Tour', 'Guided city sightseeing tour', 1500, 'flat', 27);
