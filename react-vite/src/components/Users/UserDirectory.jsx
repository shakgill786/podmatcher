// react-vite/src/components/Users/UserDirectory.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersThunk } from "../../store/usersSlice";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function UserDirectory() {
  const dispatch = useDispatch();
  const users    = useSelector((state) => state.users);

  // filter state
  const [searchTerm,     setSearchTerm]     = useState("");
  const [roleFilter,     setRoleFilter]     = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // load users on mount
  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  // derive unique categories
  const categories = useMemo(() => {
    const cats = users.map((u) => u.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [users]);

  // apply search + filters
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.username
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole =
        !roleFilter || u.role === roleFilter;
      const matchesCategory =
        !categoryFilter || u.category === categoryFilter;

      return matchesSearch && matchesRole && matchesCategory;
    });
  }, [users, searchTerm, roleFilter, categoryFilter]);

  return (
    <main className="hero">
      <div className="hero-card">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          🔍 Browse MicMates
        </h2>

        {/* Filters container */}
        <div className="
          bg-white/50 backdrop-blur-lg
          px-6 py-4
          rounded-full
          shadow-md
          flex flex-col sm:flex-row
          items-center justify-between
          gap-4 mb-6
        ">
          {/* Search input */}
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Search by username…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full
                pl-4 pr-10 py-2
                bg-white/80
                border-2 border-gray-200
                rounded-full
                shadow-sm
                focus:outline-none focus:border-indigo-500
                transition
              "
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  text-gray-500 hover:text-gray-700
                "
              >
                ×
              </button>
            )}
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="
              px-4 py-2
              bg-white/80
              border-2 border-gray-200
              rounded-full
              shadow-sm
              focus:outline-none focus:border-indigo-500
              transition
            "
          >
            <option value="">All Roles</option>
            <option value="host">Host</option>
            <option value="guest">Guest</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="
              px-4 py-2
              bg-white/80
              border-2 border-gray-200
              rounded-full
              shadow-sm
              focus:outline-none focus:border-indigo-500
              transition
            "
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-700">
            No MicMates match your filters.
          </p>
        ) : (
          <div className="grid-users">
            {filtered.map((u) => (
              <motion.div
                key={u.id}
                className="
                  card flex flex-col justify-between
                  transform hover:-translate-y-1 hover:scale-105
                  transition
                "
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {u.username}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {u.bio?.slice(0, 80) || "No bio yet."}
                  </p>
                  <p className="text-sm">
                    <strong>Role:</strong> {u.role}
                  </p>
                  <p className="text-sm">
                    <strong>Category:</strong> {u.category || "—"}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/profile/${u.id}`}
                    className="btn btn-outline flex-1 text-center"
                  >
                    👀 View
                  </Link>
                  <Link
                    to={`/messages/${u.id}`}
                    className="btn btn-primary flex-1 text-center"
                  >
                    💬 Message
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
