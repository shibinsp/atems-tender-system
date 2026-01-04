import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Loading from '../../components/ui/Loading';
import { analyticsService } from '../../services/featureServices';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'publish' | 'deadline' | 'opening';
  tender_id: number;
}

export default function TenderCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await analyticsService.getCalendarEvents();
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Error loading events:', err);
    }
    setLoading(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'publish': return { bg: '#eff6ff', color: '#2563eb' };
      case 'deadline': return { bg: '#fef2f2', color: '#dc2626' };
      case 'opening': return { bg: '#f0fdf4', color: '#16a34a' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  if (loading) return <Loading text="Loading calendar..." />;

  const upcomingEvents = events.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Tender Calendar"
        subtitle="View all tender events and deadlines"
        icon={<Calendar size={24} color="#1e3a5f" />}
      />

      {/* Legend */}
      <Card style={{ marginBottom: 24 }}>
        <CardContent style={{ padding: '12px 20px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { type: 'publish', label: 'Publish Date' },
            { type: 'deadline', label: 'Submission Deadline' },
            { type: 'opening', label: 'Bid Opening' }
          ].map(item => {
            const style = getEventStyle(item.type);
            return (
              <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: style.color }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="calendar-grid">
        {/* Calendar */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} style={{ padding: 8, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }}>
                <ChevronLeft size={20} color="#374151" />
              </button>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} style={{ padding: 8, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }}>
                <ChevronRight size={20} color="#374151" />
              </button>
            </div>

            {/* Day Names */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
              {dayNames.map(day => (
                <div key={day} style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#6b7280', backgroundColor: '#f9fafb' }}>{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: 80, padding: 8, borderBottom: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6', backgroundColor: '#fafafa' }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                return (
                  <div key={day} style={{ minHeight: 80, padding: 8, borderBottom: '1px solid #f3f4f6', borderRight: '1px solid #f3f4f6', backgroundColor: isToday(day) ? '#eff6ff' : '#fff' }}>
                    <div style={{ fontSize: 13, fontWeight: isToday(day) ? 700 : 500, color: isToday(day) ? '#2563eb' : '#374151', marginBottom: 4 }}>{day}</div>
                    {dayEvents.slice(0, 2).map(event => {
                      const style = getEventStyle(event.type);
                      return (
                        <div key={event.id} style={{ fontSize: 10, padding: '2px 4px', marginBottom: 2, borderRadius: 3, backgroundColor: style.bg, color: style.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.title.slice(0, 15)}...
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && <div style={{ fontSize: 10, color: '#6b7280' }}>+{dayEvents.length - 2} more</div>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="#2563eb" /> Upcoming Events
              </h3>
            </div>
            {upcomingEvents.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                <Calendar size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p>No upcoming events</p>
              </div>
            ) : (
              <div>
                {upcomingEvents.map(event => {
                  const style = getEventStyle(event.type);
                  return (
                    <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: style.color }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#111827', margin: 0 }}>{event.title}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
                          {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 500, borderRadius: 20, backgroundColor: style.bg, color: style.color, textTransform: 'capitalize' }}>
                        {event.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .calendar-grid { grid-template-columns: 2fr 1fr; }
        }
      `}</style>
    </div>
  );
}
