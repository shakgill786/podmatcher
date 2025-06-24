import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersThunk } from "../../store/usersSlice";
import { Link } from "react-router-dom";

export default function UserDirectory() {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.users);

  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  return (
    <div className="container py-8">
      <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
        🔍 Browse MicMates
      </h2>
      {users.length === 0 ? (
        <p className="text-center text-gray-700">No other users yet.</p>
      ) : (
        <div className="grid-users">
          {users.map((u) => (
            <div key={u.id} className="card flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-1">{u.username}</h3>
                <p className="text-sm text-gray-600 mb-2">{u.bio?.slice(0, 80) || "No bio yet."}</p>
                <p className="text-sm"><strong>Role:</strong> {u.role}</p>
                <p className="text-sm"><strong>Category:</strong> {u.category || "—"}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/profile/${u.id}`} className="btn btn-outline flex-1 text-center">
                  👀 View
                </Link>
                <Link to={`/messages/${u.id}`} className="btn btn-primary flex-1 text-center">
                  💬 Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
