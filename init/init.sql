-- 建立採樣點資料表
CREATE TABLE sampling_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL
);

-- 建立物種資料表
CREATE TABLE species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- 建立採樣點的物種分佈資料表
CREATE TABLE species_distribution (
    id SERIAL PRIMARY KEY,
    sampling_point_id INTEGER NOT NULL REFERENCES sampling_points(id),
    species_id INTEGER NOT NULL REFERENCES species(id),
    percentage DOUBLE PRECISION NOT NULL,
    UNIQUE (sampling_point_id, species_id)
);

-- 插入範例採樣點
INSERT INTO sampling_points (name, lat, lng) VALUES
('NCUE', 24.079, 120.549),
('NCNU', 23.96, 120.95);

-- 插入範例物種
INSERT INTO species (name) VALUES
('Acinetobacter'),
('Staphylococcus'),
('Apis mellifera'),
('Apis cerana');

-- 插入 NCUE 的物種分佈
INSERT INTO species_distribution (sampling_point_id, species_id, percentage) VALUES
(1, 1, 97.06),
(1, 2, 2.94);

-- 插入 NCNU 的物種分佈
INSERT INTO species_distribution (sampling_point_id, species_id, percentage) VALUES
(2, 3, 80.0),
(2, 4, 20.0);
