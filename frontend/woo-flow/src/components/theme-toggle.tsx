"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Initialize theme based on user preference or system preference
  useEffect(() => {
    // Check local storage first
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setIsDarkTheme(storedTheme === "dark");
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-muted/40 hover:bg-muted transition-colors"
      title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDarkTheme ? (
        <span className="material-icons">light_mode</span>
      ) : (
        <span className="material-icons">dark_mode</span>
      )}
    </button>
  );
}
