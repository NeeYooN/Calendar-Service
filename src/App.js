import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import moment from 'moment';
import './App.css';

const App = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState(null);
  const [holidayDescription, setHolidayDescription] = useState('');
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [workingDays, setWorkingDays] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [updatingHoliday, setUpdatingHoliday] = useState(null); 

  useEffect(() => {
    const fetchedClients = [
      { id: 1, name: 'Client 1', calendars: [{ id: 1, name: 'Calendar A' }, { id: 2, name: 'Calendar B' }] },
      { id: 2, name: 'Client 2', calendars: [{ id: 1, name: 'Calendar C' }] },
    ];
    setClients(fetchedClients);
  }, []);

  const handleClientChange = (event) => {
    setSelectedClient(event.target.value);
    setSelectedCalendar(null);
    setHolidays([]);
  };

  const handleCalendarChange = (event) => {
    const calendarId = event.target.value;
    setSelectedCalendar(calendarId);
    if (calendarId) {
      setHolidays([]);
    }
  };

  const handleHolidaySubmit = () => {
    if (holidayDate && holidayDescription) {
      const newHoliday = {
        date: moment(holidayDate).format('YYYY-MM-DD'),
        description: holidayDescription,
      };
      setHolidays((prev) => [...prev, newHoliday]);
      setShowHolidayForm(false);
      setHolidayDescription('');
      setHolidayDate(null);
    }
  };

  const handleDeleteHoliday = (date) => {
    setHolidays(holidays.filter((holiday) => holiday.date !== date));
  };

  const handleUpdateHoliday = (holiday) => {
    setUpdatingHoliday(holiday); 
    setHolidayDate(holiday.date);
    setHolidayDescription(holiday.description);
    setShowHolidayForm(true);
  };

  const handleUpdateHolidaySubmit = () => {
    if (holidayDate && holidayDescription && updatingHoliday) {
      const updatedHolidays = holidays.map((holiday) =>
        holiday.date === updatingHoliday.date
          ? { ...holiday, date: moment(holidayDate).format('YYYY-MM-DD'), description: holidayDescription }
          : holiday
      );
      setHolidays(updatedHolidays);
      setShowHolidayForm(false);
      setHolidayDescription('');
      setHolidayDate(null);
      setUpdatingHoliday(null); 
    }
  };

  const calculateWorkingDays = () => {
    if (startDate && endDate) {
      const start = moment(startDate);
      const end = moment(endDate);
      let workingDayCount = 0;

      let current = start;
      while (current <= end) {
        if (current.isoWeekday() !== 6 && current.isoWeekday() !== 7 && !holidays.some(holiday => holiday.date === current.format('YYYY-MM-DD'))) {
          workingDayCount++;
        }
        current = current.add(1, 'days');
      }

      setWorkingDays(workingDayCount);
    }
  };

  return (
    <div className="app">
      <h1> Calendar Service</h1>

      <label htmlFor="client">Select Client: </label>
      <select id="client" onChange={handleClientChange}>
        <option value="">Select Client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {selectedClient && (
        <div>

          <label htmlFor="calendar">Select Calendar: </label>
          <select id="calendar" onChange={handleCalendarChange}>
            <option value="">Select Calendar</option>
            {clients
              .find((client) => client.id === parseInt(selectedClient))
              ?.calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name}
                </option>
              ))}
          </select>

          {selectedCalendar && (
            <div>

              <h3>Client Calendar</h3>
              <Calendar
                onChange={setHolidayDate}
                value={holidayDate}
                tileClassName={({ date, view }) => {
                  const isHoliday = holidays.some(
                    (holiday) => holiday.date === moment(date).format('YYYY-MM-DD')
                  );
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
                  if (isHoliday) {
                    return 'holiday-date';
                  } else if (isWeekend) {
                    return 'weekend-date';
                  }
                  return '';
                }}
              />

              <h4>Client Holidays</h4>
              <ul>
                {holidays.map((holiday) => (
                  <li key={holiday.date}>
                    {holiday.date} - {holiday.description}
                    <button onClick={() => handleDeleteHoliday(holiday.date)}>Delete</button>
                    <button onClick={() => handleUpdateHoliday(holiday)}>Update</button>
                  </li>
                ))}
              </ul>

              <button onClick={() => setShowHolidayForm(true)}>Add Holiday</button>

              {showHolidayForm && (
                <div className="holiday-form">
                  <h4>{updatingHoliday ? 'Update Holiday' : 'Select a Date for New Holiday'}</h4>
                  <input
                    type="date"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Holiday Description"
                    value={holidayDescription}
                    onChange={(e) => setHolidayDescription(e.target.value)}
                  />
                  <button onClick={updatingHoliday ? handleUpdateHolidaySubmit : handleHolidaySubmit}>
                    {updatingHoliday ? 'Update Holiday' : 'Submit Holiday'}
                  </button>
                  <button onClick={() => setShowHolidayForm(false)}>Cancel</button>
                </div>
              )}

              <div>
                <h3>Enter Date Range for Working Days</h3>
                <label>
                  Start Date:
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </label>
                <button onClick={calculateWorkingDays}>Calculate Working Days</button>

                {workingDays > 0 && (
                  <div>
                    <h4>Number of Working Days:</h4>
                    <p>{workingDays}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
