-- FitTrack Pro seed data
-- Run after setup_fittrack.sql

INSERT INTO records (exercice, groupe, poids, reps, date, notes) VALUES
('Bench haltères', 'Poitrine', 58, 1, '2026-03-21', '1RM'),
('Bench barre', 'Poitrine', 125, 1, '2026-03-01', 'Estimé'),
('Dips lestés', 'Poitrine', 100, 2, '2026-03-15', 'Sans coudière'),
('Tractions pronation', 'Dos', 45, 1, '2026-03-15', 'RPE 10, tire avec bras — technique à corriger'),
('Back Squat', 'Jambes', 150, 1, '2026-03-15', 'Technique à revoir'),
('OHP barre', 'Épaules', 65, 1, '2026-03-01', ''),
('OHP haltères', 'Épaules', 36, 1, '2026-03-01', 'Estimé'),
('RDL belt squat', 'Jambes', 120, 6, '2026-03-15', ''),
('Curl barre', 'Bras', 46, 5, '2026-03-15', ''),
('Row barre', 'Dos', 81, 6, '2026-03-15', '')
ON CONFLICT DO NOTHING;

INSERT INTO grocery_list (categorie, article, quantite, ordre) VALUES
('Protéines', 'Filet de poulet', '1 kg', 1),
('Protéines', 'Steak haché 5%', '1 kg', 2),
('Protéines', 'Rumsteak de cheval', 'x2', 3),
('Protéines', 'Dinde', '500g-1kg', 4),
('Protéines', 'Oeufs', 'x20 (2 boites)', 5),
('Protéines', 'Foie de volaille', '200g', 6),
('Protéines', 'Sardines conserve', 'x4', 7),
('Produits laitiers', 'Fromage blanc 0%', 'x3-4 pots', 8),
('Produits laitiers', 'Fromage blanc 3%', 'x2 pots', 9),
('Produits laitiers', 'Fromage de brebis', '', 10),
('Produits laitiers', 'Carrés frais', '', 11),
('Féculents', 'Riz basmati', '1 paquet', 12),
('Féculents', 'Patate douce', '1-1.5 kg', 13),
('Féculents', 'Pomme de terre', '1 kg', 14),
('Féculents', 'Blé type Ebly', '', 15),
('Féculents', 'Lentilles', '', 16),
('Féculents', 'Pain complet / levain', '', 17),
('Légumes', 'Brocolis surgelés', 'x2 sachets', 18),
('Légumes', 'Courgettes surgelées', 'x2 sachets', 19),
('Légumes', 'Épinards frais', '', 20),
('Légumes', 'Asperges', '', 21),
('Légumes', 'Betteraves', '', 22),
('Légumes', 'Carottes', '', 23),
('Fruits', 'Bananes', 'régime', 24),
('Fruits', 'Kiwis', 'x6-8', 25),
('Fruits', 'Fruits rouges surgelés', '', 26),
('Fruits', 'Dattes', '', 27),
('Lipides', 'Amandes', 'vrac', 28),
('Lipides', 'Cerneaux de noix', '', 29),
('Lipides', 'Huile d''olive VE', '', 30),
('Lipides', 'Avocat', 'x2-3', 31),
('Lipides', 'Graines de chia', '', 32),
('Condiments', 'Ail frais', '', 33),
('Condiments', 'Oignons', '', 34),
('Condiments', 'Gingembre frais', '', 35),
('Condiments', 'Miel', '', 36),
('Condiments', 'Chocolat noir 85%+', '', 37)
ON CONFLICT DO NOTHING;

INSERT INTO profiles (nom, age, taille_cm, poids_kg, poids_objectif, bf_estime, calories_cible, proteines_cible, lipides_cible, glucides_cible)
VALUES ('Dimitri', 22, 163, 66.5, 66.0, '12-13%', 2200, 140, 60, 275)
ON CONFLICT DO NOTHING;
