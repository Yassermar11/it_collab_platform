-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 15 juil. 2025 à 00:37
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `it`
--

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `content` text NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `content`, `sender_id`, `receiver_id`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 'salaaaam', 1, 3, 0, '2025-07-14 16:29:59', '2025-07-14 16:29:59'),
(2, 'saymkom', 1, 3, 0, '2025-07-14 17:26:36', '2025-07-14 17:26:36');

-- --------------------------------------------------------

--
-- Structure de la table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `assigned_users` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `projects`
--

INSERT INTO `projects` (`id`, `name`, `assigned_users`, `status`, `description`, `created_at`) VALUES
(1, 'Project 2', '1', 'active', '', '2025-07-12 18:13:18'),
(2, 'Project Alpha', '1', 'active', '', '2025-07-12 18:13:18'),
(3, 'Project Beta', '1', 'not started', '', '2025-07-12 18:13:18'),
(4, 'Project Gamma', '1', 'done', '', '2025-07-12 18:13:18');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` bigint(20) NOT NULL,
  `data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('L_o60N5KueXJ47kHxbnFuEyqr1c-daWV', 1752618896, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-07-15T22:22:25.022Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"userId\":1,\"username\":\"testuser\"}');

-- --------------------------------------------------------

--
-- Structure de la table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT 'Task status: pending, in_progress, or completed',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `project_id` int(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tasks`
--

INSERT INTO `tasks` (`id`, `name`, `assigned_to`, `due_date`, `status`, `description`, `created_at`, `project_id`) VALUES
(11, 'Rédiger le rapport de projet', 1, '2025-07-14 23:59:59', 'in_progress', 'jyujyuj', '2025-07-12 21:42:04', 1),
(12, 'Corriger le bug de connexion', 1, '2025-07-12 18:00:00', 'in_progress', 'yujujyju', '2025-07-12 21:42:04', 2),
(13, 'Envoyer l\'invitation Zoom', 1, '2025-07-11 12:00:00', 'completed', 'jyujuyj', '2025-07-12 21:42:04', 3);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `username` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `created_at`, `username`, `role`) VALUES
(1, 'test@example.com', '$2b$10$DJH8NAN6Y6RYdMlobyiTM.36thNutxs.8KtuUkE5HEEMnXoq9KaXS', '2025-07-11 16:31:16', 'testuser', 'Owner'),
(2, 'test@gmail.com', 'testtest', '2025-07-14 03:54:17', 'user', 'Dev'),
(3, 'test2@gmail.com', 'testtest', '2025-07-14 15:32:26', 'test2', 'Dev');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `senderId` (`sender_id`),
  ADD KEY `receiverId` (`receiver_id`);

--
-- Index pour la table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
