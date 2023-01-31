import React from "react";

const PrayerList = ({ prayerTimes }) => {
  const Fajr = convertTo12Hour(prayerTimes?.Fajr);
  const Sunrise = convertTo12Hour(prayerTimes?.Sunrise);
  const Dhuhr = convertTo12Hour(prayerTimes?.Dhuhr);
  const Asr = convertTo12Hour(prayerTimes?.Asr);
  const Maghrib = convertTo12Hour(prayerTimes?.Maghrib);
  const Isha = convertTo12Hour(prayerTimes?.Isha);

  function convertTo12Hour(time) {
    let hours = parseInt(time.substr(0, 2));
    let minutes = time.substr(3);
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  return (
    <div>
      <h3>Today's Prayer Times</h3>
      <p>
        <span className="prayer">Fajr:</span> {`${Fajr} - ${Sunrise}`}
      </p>
      <p>
        <span className="prayer">Dhuhr:</span> {` ${Dhuhr} - ${Asr}`}
      </p>
      <p>
        <span className="prayer">Asr:</span> {` ${Asr} - ${Maghrib}`}
      </p>
      <p>
        <span className="prayer">Maghrib:</span> {` ${Maghrib} - ${Isha}`}
      </p>
      <p>
        <span className="prayer">Isha:</span> {` ${Isha} - ${Fajr}`}
      </p>
    </div>
  );
};

export default PrayerList;
