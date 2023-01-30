import React from "react";

const PrayerList = ({ prayerTimes }) => {
  return (
    <div>
      <h3>Today's Prayer Times</h3>
      <p>
        <span className="prayer">Fajr:</span>{" "}
        {`${prayerTimes[0]?.fajr} - ${prayerTimes[0]?.shurooq}`}
      </p>
      <p>
        <span className="prayer">Dhuhr:</span>{" "}
        {` ${prayerTimes[0]?.dhuhr} - ${prayerTimes[0]?.asr}`}
      </p>
      <p>
        <span className="prayer">Asr:</span>{" "}
        {` ${prayerTimes[0]?.asr} - ${prayerTimes[0]?.maghrib}`}
      </p>
      <p>
        <span className="prayer">Maghrib:</span>{" "}
        {` ${prayerTimes[0]?.maghrib} - ${prayerTimes[0]?.isha}`}
      </p>
      <p>
        <span className="prayer">Isha:</span>{" "}
        {` ${prayerTimes[0]?.isha} - ${prayerTimes[0]?.fajr}`}
      </p>
    </div>
  );
};

export default PrayerList;
