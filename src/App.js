import "./App.css";
import React, { useState, useEffect } from "react";
import moment from "moment";
import "./App.css";
import PrayerList from "./PrayerList/PrayerList";
import Footer from "./Footer/Footer";
import { FallingLines, ThreeCircles } from "react-loader-spinner";
function App() {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [PrayerName, setPrayerName] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [HijriDate, setHijriDate] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = moment();
      const { nextPrayerTime, prayerName } = getNextPrayerTime(
        currentTime,
        prayerTimes
      );
      const diff = moment.duration(nextPrayerTime.diff(currentTime));
      setRemainingTime(diff);
      setPrayerName(prayerName);
      setNextPrayer(nextPrayerTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);
  useEffect(() => {
    fetch(
      "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=8"
    )
      .then((response) => response.json())
      .then((data) => {
        const HijriDate = {
          day: data.data.date.hijri.day,
          month: data.data.date.hijri.month.en,
          year: data.data.date.hijri.year,
          abbreviated: data.data.date.hijri.designation.abbreviated,
        };
        setHijriDate(HijriDate);
        // console.log(data.data);
        setPrayerTimes(data.data.timings);
        setIsLoading(false);
      });
  }, []);
  return (
    <div>
      {isLoading ? (
        <div className="load">
          <div>
            <ThreeCircles
              height="100"
              width="100"
              color="rgb(199, 195, 195)"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
              ariaLabel="three-circles-rotating"
              outerCircleColor=""
              innerCircleColor=""
              middleCircleColor=""
            />
          </div>
        </div>
      ) : (
        <div>
          {prayerTimes ? (
            <div>
              <div className="cp">{nextPrayerTime(nextPrayer)}</div>
              <div>{`${HijriDate.month} ${HijriDate.day}, ${HijriDate.year} ${HijriDate.abbreviated}`}</div>
              <div className="rt">
                <span className="prayer">{`${PrayerName}`}</span>
                {formatTime(remainingTime)}
              </div>
              <PrayerList prayerTimes={prayerTimes} />
              <Footer></Footer>
            </div>
          ) : (
            <div>
              <ThreeCircles
                height="100"
                width="100"
                color="rgb(199, 195, 195)"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                ariaLabel="three-circles-rotating"
                outerCircleColor=""
                innerCircleColor=""
                middleCircleColor=""
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const getNextPrayerTime = (currentTime, prayerTimes) => {
  if (!prayerTimes) {
    return null;
  }
  const prayerMoments = {
    Fajr: moment(prayerTimes?.Fajr, "hh:mm"),
    Sunrise: moment(prayerTimes?.Sunrise, "hh:mm"),
    Dhuhr: moment(prayerTimes?.Dhuhr, "hh:mm"),
    Asr: moment(prayerTimes?.Asr, "hh:mm"),
    Maghrib: moment(prayerTimes?.Maghrib, "hh:mm"),
    Isha: moment(prayerTimes?.Isha, "hh:mm"),
  };

  let nextPrayerTime = null;
  let prayerName = null;
  for (const prayer of Object.keys(prayerMoments)) {
    if (currentTime.isBefore(prayerMoments[prayer])) {
      nextPrayerTime = prayerMoments[prayer];
      prayerName = prayer;
      break;
    }
  }

  if (!nextPrayerTime) {
    nextPrayerTime = prayerMoments.Fajr?.add(1, "days");
    prayerName = "Fajr";
  }

  return { nextPrayerTime, prayerName };
};

const formatTime = (time) => {
  if (!time) {
    return null;
  }

  if (time.asHours() < 1) {
    return ` in ${time.minutes()} minutes ${time.seconds()} seconds`;
  }

  return ` in ${time.hours()} hours, ${time.minutes()} minutes`;
};
const nextPrayerTime = (nextPrayer) => {
  if (!nextPrayer)
    return (
      <FallingLines
        color="rgb(199, 195, 195)"
        width="100"
        visible={true}
        ariaLabel="falling-lines-loading"
      />
    );

  return `${nextPrayer.format("h:mm a")}`;
};
export default App;
