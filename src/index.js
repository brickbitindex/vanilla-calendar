const template = `<div class="vcal-header">
  <button class="vcal-btn" data-calendar-toggle="previous"></button>
  <div class="vcal-header__label" data-calendar-label="month"></div>
  <button class="vcal-btn" data-calendar-toggle="next"></button>
</div>
<div class="vcal-week"></div>
<div class="vcal-body" data-calendar-area="month"></div>`;

const NULL_FUNC = () => false;

const defaultOptions = {
  onSelect: NULL_FUNC,
  monthNames: [
    'January',
    'Febuary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  dayNames: [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ],
  disablePastDays: false,
  checkDisabledDate: NULL_FUNC,
  previousIcon: '<svg height="24" version="1.1" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"></path></svg>',
  nextIcon: '<svg height="24" version="1.1" viewbox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"></path></svg>',
  value: null,
};


class VanillaCalendar {
  month = null
  next = null
  previous = null
  label = null
  activeDates = null
  anchorDate = null
  todaysDate = null
  container = null
  value = null

  constructor(container, options) {
    this.container = container;
    this.container.innerHTML = template;
    this.container.classList.add('vcal-container');
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.month = this.container.querySelector('[data-calendar-area="month"]');
    this.next = this.container.querySelector('[data-calendar-toggle="next"]');
    this.previous = this.container.querySelector('[data-calendar-toggle="previous"]');
    this.label = this.container.querySelector('[data-calendar-label="month"]');
    const anchorDate = new Date();
    anchorDate.setDate(1);
    this.anchorDate = this.getCleanDate(anchorDate);
    this.todaysDate = this.getCleanDate(new Date());
    this.value = this.getCleanDate(this.options.value);
    this.createInterface();
    this.createMonth();
    this.createListeners();
  }

  getCleanDate(date) {
    const ret = new Date(date);
    ret.setHours(12);
    ret.setMinutes(0);
    ret.setSeconds(0);
    ret.setMilliseconds(0);
    return ret;
  }

  createInterface() {
    const week = this.container.querySelector('.vcal-week');
    this.options.dayNames.forEach((name) => {
      const day = document.createElement('span');
      day.innerHTML = name;
      week.appendChild(day);
    });

    this.container.querySelector('[data-calendar-toggle="previous"]').innerHTML = this.options.previousIcon;
    this.container.querySelector('[data-calendar-toggle="next"]').innerHTML = this.options.nextIcon;
  }

  createListeners() {
    this.next.addEventListener('click', () => {
      this.clearCalendar();
      const nextMonth = this.anchorDate.getMonth() + 1;
      this.anchorDate.setMonth(nextMonth);
      this.createMonth();
    });
    // Clears the calendar and shows the previous month
    this.previous.addEventListener('click', () => {
      this.clearCalendar();
      const prevMonth = this.anchorDate.getMonth() - 1;
      this.anchorDate.setMonth(prevMonth);
      this.createMonth();
    });
  }

  createDay(date) {
    const num = date.getDate();
    const day = date.getDay();
    const newDay = document.createElement('div');
    const dateEl = document.createElement('span');
    dateEl.innerHTML = num;
    newDay.className = 'vcal-date';
    newDay.setAttribute('data-calendar-date', date);

    // if it's the first day of the month
    if (num === 1) {
      if (day === 0) {
        newDay.style.marginLeft = (6 * 14.28) + '%';
      } else {
        newDay.style.marginLeft = ((day - 1) * 14.28) + '%';
      }
    }

    // check disabled
    let disabled = false;
    if (
      (this.options.disablePastDays && date.getTime() <= this.todaysDate.getTime() - 1) ||
      (this.options.checkDisabledDate(date))
    ) {
      disabled = true;
    }
    if (disabled) {
      newDay.classList.add('vcal-date--disabled');
    } else {
      newDay.classList.add('vcal-date--active');
      newDay.setAttribute('data-calendar-status', 'active');
    }

    if (date.getTime() === this.todaysDate.getTime()) {
      newDay.classList.add('vcal-date--today');
    }

    if (this.value && date.getTime() === this.value.getTime()) {
      newDay.classList.add('vcal-date--selected');
    }

    newDay.appendChild(dateEl);
    this.month.appendChild(newDay);
  }

  createMonth() {
    const currentMonth = this.anchorDate.getMonth();
    const targetDate = new Date(this.anchorDate);
    while (targetDate.getMonth() === currentMonth) {
      this.createDay(targetDate);
      targetDate.setDate(targetDate.getDate() + 1);
    }

    this.label.innerHTML = this.options.monthNames[this.anchorDate.getMonth()] + ' ' + this.anchorDate.getFullYear();
    // bind click event to active date
    this.activeDates = this.container.querySelectorAll('[data-calendar-status="active"]');
    for (let i = 0; i < this.activeDates.length; i += 1) {
      this.activeDates[i].addEventListener('click', (e) => {
        const elm = e.currentTarget;
        const selectedDate = elm.dataset.calendarDate;
        this.removeActiveClass();
        elm.classList.add('vcal-date--selected');
        this.value = new Date(new Date(selectedDate));
        this.options.onSelect(this.value);
      });
    }
  }

  clearCalendar() {
    this.month.innerHTML = '';
  }

  removeActiveClass() {
    for (let i = 0; i < this.activeDates.length; i += 1) {
      this.activeDates[i].classList.remove('vcal-date--selected');
    }
  }
}

window.VanillaCalendar = VanillaCalendar;
export default VanillaCalendar;
