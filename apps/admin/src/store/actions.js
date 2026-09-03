export * from "./layout/actions";

// Authentication module
export * from "./auth/register/actions";
export * from "./auth/login/actions";
export * from "./auth/forgetpwd/actions";
export * from "./auth/profile/actions";

//Ecommerce
export * from "./e-commerce/actions";
export * from "./category/actions";

//Calendar
export {
  getEvents,
  getEventsSuccess,
  getEventsFail,
  addNewEvent,
  addEventSuccess,
  addEventFail,
  updateEvent,
  updateEventSuccess,
  updateEventFail,
  deleteEvent,
  deleteEventSuccess,
  deleteEventFail,
} from "./calendar/actions";

//chat
export * from "./chat/actions";

//invoices
export * from "./invoices/actions";

// contacts
export * from "./contacts/actions";

// contacts
export * from "./mails/actions";

//dashboard
export * from "./dashboard/actions";

//dashboard-saas
export * from "./dashboard-saas/actions";

//dashboard-blog
export * from "./dashboard-blog/actions";