import "./App.css";
import React, { useState, useEffect } from "react";
import moment from "moment";
import "./App.css";
import PrayerList from "./PrayerList/PrayerList";
function App() {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [PrayerName, setPrayerName] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "77ea2f6f6cmsh832c60d7c313840p1206d8jsn1e21715fed7b",
      "X-RapidAPI-Host": "muslimsalat.p.rapidapi.com",
    },
  };
  useEffect(() => {
    // Fetch the prayer times from the API
    fetch("https://muslimsalat.p.rapidapi.com/dhaka.json", options)
      .then((response) => response.json())
      .then((data) => {
        setPrayerTimes(data.items);
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate the remaining time until the next prayer
      const currentTime = moment();

      const nextPrayerTime = getNextPrayerTime(
        currentTime,
        prayerTimes,
        setPrayerName,
        setNextPrayer
      );
      const diff = moment.duration(nextPrayerTime.diff(currentTime));
      setRemainingTime(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {prayerTimes ? (
            <div>
              <div className="rt">{formatTime(remainingTime, PrayerName)}</div>
              <div className="cp">{nextPrayerTime(nextPrayer)}</div>
              <PrayerList prayerTimes={prayerTimes} />
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      )}
    </div>
  );
}

const getNextPrayerTime = (
  currentTime,
  prayerTimes,
  setPrayerName,
  setNextPrayer
) => {
  // Calculate the next prayer time based on the current time and the prayer times from the API
  if (!prayerTimes) {
    return null;
  }

  const prayerMoments = {
    Fajr: moment(prayerTimes[0]?.fajr, "hh:mm"),
    Sunrise: moment(prayerTimes[0]?.shurooq, "hh:mm"),
    Dhuhr: moment(prayerTimes[0]?.dhuhr, "hh:mm"),
    Asr: moment(prayerTimes[0]?.asr, "hh:mm"),
    Maghrib: moment(prayerTimes[0]?.maghrib, "hh:mm"),
    Isha: moment(prayerTimes[0]?.isha, "hh:mm"),
  };

  // Find the next prayer time that is after the current time
  let nextPrayerTime = null;
  for (const prayer of Object.keys(prayerMoments)) {
    if (currentTime.isBefore(prayerMoments[prayer])) {
      nextPrayerTime = prayerMoments[prayer];
      setNextPrayer(nextPrayerTime);
      setPrayerName(prayer);
      break;
    }
  }

  // If all prayer times have passed, set the next prayer time to the time for the first prayer of the next day
  if (!nextPrayerTime) {
    nextPrayerTime = prayerMoments["Fajr"]?.add(1, "days");
  }
  return nextPrayerTime;
};
const formatTime = (time, PrayerName) => {
  // Convert the time to a human-readable format
  if (!time) {
    return null;
  }

  if (time.asHours() < 1) {
    return `${PrayerName} in ${time.minutes()} minutes ${time.seconds()} seconds`;
  }

  return `${PrayerName} in ${time.hours()} hours, ${time.minutes()} minutes, ${time.seconds()} seconds`;
};
const nextPrayerTime = (nextPrayer) => {
  return `${nextPrayer?._i}`;
};
export default App;
