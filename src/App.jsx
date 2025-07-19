import { FallingLines, ThreeCircles } from "react-loader-spinner";
import { FaGithub, FaFacebook, FaLinkedinIn } from "react-icons/fa";

import { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";

// Cache management
const CACHE_KEY = "prayerTimesCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getCachedData = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const now = Date.now();

    if (cached.timestamp && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  } catch (error) {
    console.warn("Error reading cache:", error);
  }
  return null;
};

const setCachedData = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Error setting cache:", error);
  }
};

const convertTo12Hour = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

const formatTime = (duration) => {
  if (!duration) return null;

  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return ` in ${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} minute${
      minutes !== 1 ? "s" : ""
    }`;
  }
  return ` in ${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${
    seconds !== 1 ? "s" : ""
  }`;
};

const getCurrentTime = () => new Date();

const parseTime = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const getNextPrayerTime = (currentTime, prayerTimes) => {
  if (!prayerTimes) return { nextPrayerTime: null, prayerName: null };

  const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const today = new Date(currentTime);

  for (const prayer of prayerOrder) {
    if (prayerTimes[prayer]) {
      const prayerTime = parseTime(prayerTimes[prayer]);
      if (currentTime < prayerTime) {
        return { nextPrayerTime: prayerTime, prayerName: prayer };
      }
    }
  }

  // Next prayer is Fajr tomorrow
  const tomorrowFajr = parseTime(prayerTimes.Fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return { nextPrayerTime: tomorrowFajr, prayerName: "Fajr" };
};

// Components
const PrayerList = ({ prayerTimes }) => {
  const prayerData = useMemo(() => {
    if (!prayerTimes) return [];

    return [
      { name: "Fajr", start: prayerTimes.Fajr, end: prayerTimes.Sunrise },
      { name: "Dhuhr", start: prayerTimes.Dhuhr, end: prayerTimes.Asr },
      { name: "Asr", start: prayerTimes.Asr, end: prayerTimes.Maghrib },
      { name: "Maghrib", start: prayerTimes.Maghrib, end: prayerTimes.Isha },
      { name: "Isha", start: prayerTimes.Isha, end: prayerTimes.Fajr },
    ].map((prayer) => ({
      ...prayer,
      startFormatted: convertTo12Hour(prayer.start),
      endFormatted: convertTo12Hour(prayer.end),
    }));
  }, [prayerTimes]);

  return (
    <div>
      <h3>Today's Prayer Times</h3>
      {prayerData.map((prayer) => (
        <p key={prayer.name}>
          <span className="prayer">{prayer.name}:</span> {prayer.startFormatted}{" "}
          - {prayer.endFormatted}
        </p>
      ))}
    </div>
  );
};

const Footer = () => {
  return (
    <div className="footer">
      <a
        href="https://github.com/HasanC14/Islamic-Prayer-Time"
        target="_blank"
        rel="noreferrer"
      >
        <FaGithub />
      </a>
      <a
        href="https://www.facebook.com/hasan.chowdhuryD/"
        target="_blank"
        rel="noreferrer"
      >
        <FaFacebook />
      </a>
      <a
        href="https://www.linkedin.com/in/hasanchowdhuryd/"
        target="_blank"
        rel="noreferrer"
      >
        <FaLinkedinIn />
      </a>
    </div>
  );
};

const NextPrayerTime = ({ nextPrayer }) => {
  if (!nextPrayer) {
    return (
      <FallingLines
        color="rgb(199, 195, 195)"
        width="100"
        visible={true}
        ariaLabel="falling-lines-loading"
      />
    );
  }

  const hours = nextPrayer.getHours();
  const minutes = nextPrayer.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");

  return `${displayHours}:${displayMinutes} ${ampm}`;
};

// Main App Component
function App() {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerName, setPrayerName] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Fetch prayer times with caching
  const fetchPrayerTimes = useCallback(async () => {
    try {
      // Check cache first
      const cachedData = getCachedData();
      if (cachedData) {
        setPrayerTimes(cachedData.timings);
        setHijriDate(cachedData.hijriDate);
        setIsLoading(false);
        setIsOffline(false);
        return;
      }

      // Fetch from API
      const response = await fetch(
        "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=8"
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const hijriInfo = {
        day: data.data.date.hijri.day,
        month: data.data.date.hijri.month.en,
        year: data.data.date.hijri.year,
        abbreviated: data.data.date.hijri.designation.abbreviated,
      };

      // Cache the data
      setCachedData({
        timings: data.data.timings,
        hijriDate: hijriInfo,
      });

      setHijriDate(hijriInfo);
      setPrayerTimes(data.data.timings);
      setIsLoading(false);
      setIsOffline(false);
    } catch (error) {
      console.error("Error fetching prayer times:", error);

      // Try to use cached data even if expired
      const cachedData = getCachedData();
      if (cachedData) {
        setPrayerTimes(cachedData.timings);
        setHijriDate(cachedData.hijriDate);
        setIsOffline(true);
      }
      setIsLoading(false);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!prayerTimes) return;

    const updateTimer = () => {
      const currentTime = getCurrentTime();
      const { nextPrayerTime, prayerName: nextPrayerName } = getNextPrayerTime(
        currentTime,
        prayerTimes
      );

      if (nextPrayerTime) {
        const timeDiff = nextPrayerTime.getTime() - currentTime.getTime();
        setRemainingTime(timeDiff);
        setPrayerName(nextPrayerName);
        setNextPrayer(nextPrayerTime);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Initial data fetch
  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="load">
        <div>
          <ThreeCircles
            height="100"
            width="100"
            color="rgb(199, 195, 195)"
            visible={true}
          />
        </div>
      </div>
    );
  }

  if (!prayerTimes) {
    return (
      <div className="load">
        <div>
          <p>
            Unable to load prayer times. Please check your internet connection.
          </p>
          <button
            onClick={fetchPrayerTimes}
            style={{
              padding: "10px 20px",
              marginTop: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isOffline && (
        <div
          style={{
            backgroundColor: "#ffeaa7",
            color: "#2d3436",
            padding: "10px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          You're offline. Showing cached prayer times.
        </div>
      )}

      <div className="cp">
        <NextPrayerTime nextPrayer={nextPrayer} />
      </div>

      <div>
        {hijriDate &&
          `${hijriDate.month} ${hijriDate.day}, ${hijriDate.year} ${hijriDate.abbreviated}`}
      </div>

      <div className="rt">
        <span className="prayer">{prayerName}</span>
        {formatTime(remainingTime)}
      </div>

      <PrayerList prayerTimes={prayerTimes} />
      <Footer />

      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @keyframes wave {
          0%,
          40%,
          100% {
            transform: scaleY(0.4);
          }
          20% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
