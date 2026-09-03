import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  // =========================
  // TASKS
  // =========================

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("littleListTasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [input, setInput] = useState("");

  // =========================
  // EDIT
  // =========================

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // =========================
  // SEARCH & FILTER
  // =========================

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // =========================
  // REMINDER
  // =========================

  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("15");

  // =========================
  // NOTIFICATION PERMISSION
  // =========================

  const [notificationPermission, setNotificationPermission] =
    useState(() => {
      if ("Notification" in window) {
        return Notification.permission;
      }

      return "unsupported";
    });

  // =========================
  // SAVE TASKS
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "littleListTasks",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  // =========================
  // ENABLE NOTIFICATIONS
  // =========================

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      alert(
        "Notifications are not supported on this browser."
      );

      setNotificationPermission("unsupported");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationPermission("granted");

      new Notification("LittleList ✨", {
        body: "Notifications are already enabled! 🔔",
      });

      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      setNotificationPermission(permission);

      if (permission === "granted") {
        new Notification("LittleList ✨", {
          body: "Notifications are now enabled! 🔔",
        });
      }

      if (permission === "denied") {
        alert(
          "Notifications are blocked. Please allow them in your browser settings."
        );
      }
    } catch (error) {
      console.error(
        "Notification permission error:",
        error
      );
    }
  };

  // =========================
  // NOTIFICATION BUTTON TEXT
  // =========================

  const notificationButtonText = () => {
    if (notificationPermission === "granted") {
      return "🔔 Notifications Enabled";
    }

    if (notificationPermission === "denied") {
      return "🚫 Notifications Blocked";
    }

    if (notificationPermission === "unsupported") {
      return "🔕 Notifications Unsupported";
    }

    return "🔔 Enable Notifications";
  };

  // =========================
  // ADD TASK
  // =========================

  const addTask = () => {
    const text = input.trim();

    if (!text) {
      alert("Please enter a task.");
      return;
    }

    if (
      (reminderDate && !reminderTime) ||
      (!reminderDate && reminderTime)
    ) {
      alert(
        "Please select both reminder date and time."
      );
      return;
    }

    const newTask = {
      id: Date.now(),
      text,
      completed: false,

      reminderDate,
      reminderTime,

      reminderMinutes:
        reminderDate && reminderTime
          ? Number(reminderMinutes)
          : null,

      reminderSent: false,
      dueNotificationSent: false,
      overdueNotificationSent: false,
    };

    setTasks((previousTasks) => [
      newTask,
      ...previousTasks,
    ]);

    setInput("");
    setReminderDate("");
    setReminderTime("");
    setReminderMinutes("15");
  };

  // =========================
  // ENTER TO ADD
  // =========================

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  };

  // =========================
  // COMPLETE TASK
  // =========================

  const toggleTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter(
        (task) => task.id !== id
      )
    );
  };

  // =========================
  // START EDITING
  // =========================

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  // =========================
  // SAVE EDIT
  // =========================

  const saveEdit = (id) => {
    const text = editingText.trim();

    if (!text) {
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              text,
            }
          : task
      )
    );

    setEditingId(null);
    setEditingText("");
  };

  // =========================
  // EDIT KEYBOARD
  // =========================

  const handleEditKeyDown = (event, id) => {
    if (event.key === "Enter") {
      saveEdit(id);
    }

    if (event.key === "Escape") {
      setEditingId(null);
      setEditingText("");
    }
  };

  // =========================
  // FILTER TASKS
  // =========================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.text
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
          ? !task.completed
          : task.completed;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  // =========================
  // STATISTICS
  // =========================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const remainingTasks =
    totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  // =========================
  // REMINDER CHECKER
  // =========================

  useEffect(() => {
    const checkReminders = () => {
      if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      const now = new Date();

      setTasks((previousTasks) => {
        let changed = false;

        const updatedTasks = previousTasks.map(
          (task) => {
            if (
              !task.reminderDate ||
              !task.reminderTime ||
              task.completed
            ) {
              return task;
            }

            const dueTime = new Date(
              `${task.reminderDate}T${task.reminderTime}`
            );

            if (Number.isNaN(dueTime.getTime())) {
              return task;
            }

            const reminderTime = new Date(
              dueTime.getTime() -
                Number(
                  task.reminderMinutes || 15
                ) *
                  60 *
                  1000
            );

            let updatedTask = task;

            // Reminder before due time
            if (
              now >= reminderTime &&
              now < dueTime &&
              !task.reminderSent
            ) {
              new Notification("LittleList 🔔", {
                body: `${task.text} is coming up! Your task is due soon.`,
              });

              updatedTask = {
                ...updatedTask,
                reminderSent: true,
              };

              changed = true;
            }

            // Due notification
            if (
              now >= dueTime &&
              !task.dueNotificationSent
            ) {
              new Notification("LittleList ⏰", {
                body: `${task.text} is due now!`,
              });

              updatedTask = {
                ...updatedTask,
                dueNotificationSent: true,
              };

              changed = true;
            }

            // 10 minutes overdue
            const overdueTime =
              dueTime.getTime() +
              10 * 60 * 1000;

            if (
              now >= overdueTime &&
              !task.overdueNotificationSent
            ) {
              new Notification("LittleList 🚨", {
                body: `Hurry up! ${task.text} is still incomplete.`,
              });

              updatedTask = {
                ...updatedTask,
                overdueNotificationSent: true,
              };

              changed = true;
            }

            return updatedTask;
          }
        );

        return changed
          ? updatedTasks
          : previousTasks;
      });
    };

    checkReminders();

    const interval = setInterval(
      checkReminders,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================
  // FORMAT REMINDER
  // =========================

  const formatReminder = (task) => {
    if (
      !task.reminderDate ||
      !task.reminderTime
    ) {
      return null;
    }

    const date = new Date(
      `${task.reminderDate}T${task.reminderTime}`
    );

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const formattedDate =
      date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    const formattedTime =
      date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    const minutes =
      task.reminderMinutes || 15;

    const reminderText =
      minutes === 60
        ? "1 hour before"
        : `${minutes} minutes before`;

    return `${formattedDate} • ${formattedTime} • ${reminderText}`;
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="app">
      <div className="todo-container">

        <h1>LittleList ✨</h1>

        <p className="tagline">
          Little tasks. Big progress.
        </p>

        {/* Notifications */}

        <button
          className="notification-button"
          onClick={enableNotifications}
          disabled={
            notificationPermission ===
            "unsupported"
          }
        >
          {notificationButtonText()}
        </button>

        {/* Statistics */}

        <div className="stats">

          <div className="stat-card">
            <span className="stat-number">
              {totalTasks}
            </span>

            <span className="stat-label">
              Total
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {completedTasks}
            </span>

            <span className="stat-label">
              Completed
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {remainingTasks}
            </span>

            <span className="stat-label">
              Remaining
            </span>
          </div>

        </div>

        {/* Progress */}

        <div className="progress-section">

          <div className="progress-header">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </div>

        {/* Add Task */}

        <div className="add-task-section">

          <div className="main-input">

            <input
              type="text"
              placeholder="What needs to be done?"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleInputKeyDown}
            />

            <button
              className="add-button"
              onClick={addTask}
            >
              Add
            </button>

          </div>

          {/* Reminder */}

          <div className="reminder-controls">

            <div className="reminder-field">

              <label>
                📅 Reminder Date
              </label>

              <input
                type="date"
                value={reminderDate}
                onChange={(event) =>
                  setReminderDate(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="reminder-field">

              <label>
                ⏰ Reminder Time
              </label>

              <input
                type="time"
                value={reminderTime}
                onChange={(event) =>
                  setReminderTime(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="reminder-field">

              <label>
                🔔 Remind Me
              </label>

              <select
                value={reminderMinutes}
                onChange={(event) =>
                  setReminderMinutes(
                    event.target.value
                  )
                }
              >
                <option value="5">
                  5 minutes before
                </option>

                <option value="10">
                  10 minutes before
                </option>

                <option value="15">
                  15 minutes before
                </option>

                <option value="30">
                  30 minutes before
                </option>

                <option value="60">
                  1 hour before
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* Search */}

        <div className="search-box">

          <input
            type="text"
            placeholder="🔍 Search your tasks..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {/* Filters */}

        <div className="filters">

          <button
            className={
              filter === "all" ? "active" : ""
            }
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={
              filter === "active" ? "active" : ""
            }
            onClick={() => setFilter("active")}
          >
            Active
          </button>

          <button
            className={
              filter === "completed"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("completed")
            }
          >
            Completed
          </button>

        </div>

        {/* Task List */}

        <div className="task-list">

          {filteredTasks.length === 0 ? (

            <div className="empty-state">
              {search
                ? "🔍 No matching tasks found."
                : filter === "completed"
                ? "✨ No completed tasks yet."
                : filter === "active"
                ? "🎉 No active tasks!"
                : "🌸 Your list is empty. Add your first task!"}
            </div>

          ) : (

            filteredTasks.map((task) => (

              <div
                className={`task ${
                  task.completed
                    ? "completed"
                    : ""
                }`}
                key={task.id}
              >

                {/* Complete */}

                <button
                  className="check-button"
                  onClick={() =>
                    toggleTask(task.id)
                  }
                >
                  {task.completed ? "✓" : ""}
                </button>

                {/* Content */}

                <div className="task-content">

                  {editingId === task.id ? (

                    <input
                      className="edit-input"
                      type="text"
                      value={editingText}
                      autoFocus
                      onChange={(event) =>
                        setEditingText(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleEditKeyDown(
                          event,
                          task.id
                        )
                      }
                    />

                  ) : (

                    <span className="task-text">
                      {task.text}
                    </span>

                  )}

                  {formatReminder(task) && (
                    <span className="task-reminder">
                      🔔 {formatReminder(task)}
                    </span>
                  )}

                </div>

                {/* Actions */}

                <div className="task-actions">

                  {editingId === task.id ? (

                    <button
                      className="save-button"
                      onClick={() =>
                        saveEdit(task.id)
                      }
                    >
                      ✓
                    </button>

                  ) : (

                    <button
                      className="edit-button"
                      onClick={() =>
                        startEditing(task)
                      }
                    >
                      ✏️
                    </button>

                  )}

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    🗑️
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

        <div className="footer-text">
          Made with 💜 for your little wins.
        </div>

      </div>
    </div>
  );
}

export default App;