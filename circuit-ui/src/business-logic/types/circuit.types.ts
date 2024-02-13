export type PlanObject = {
  title: string;
  starts: {
    day: number;
    month: number;
    year: number;
  };
};

export type DriverObject = {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
}
export type ListPlansResponse = {
  plans: (PlanObject & {
    id: string;
    depot: string;
    distributed: boolean;
    writable: boolean;
    optimization: string;
    drivers: DriverObject[];
  })[]
}
export type RouteResponse = {
  id: string;
  title: string;
  stopCount: number;
  driver: any;
  state: {
    completed: boolean;
    completedAt: string;
    distributed: boolean;
    distributedAt: string;
    notifiedRecipients: boolean;
    notifiedRecipientsAt: string;
    started: boolean;
    startedAt: string;
  }
}
export type getPlanResponse = PlanObject & {
  id: `plans/${string}`;
  depot: string;
  distributed: boolean;
  writable: boolean;
  optimization: string;
  drivers: DriverObject[];
  routes: `routes/${string}`[]

}
export type StopObject = {
  id?: `plans/${string}/stops/${string}`;
  address: {
    addressName?: string;
    addressLineOne?: string;
    addressLineTwo?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  timing?: {
    earliestAttemptTime: {
      hour: number;
      minute: number;
    };
    latestAttemptTime: {
      hour: number;
      minute: number;
    };
    estimatedAttemptDuration: 1;
  };
  recipient?: {
    externalId?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
  orderInfo?: {
    products?: string[];
    sellerOrderId?: string;
    sellerName?: string;
    sellerWebsite?: string;
  };
  driver?: string;
  allowedDrivers?: string[];
  activity?: "delivery" | "pickup";
  packageCount?: number;
  notes?: string;
  webAppLink?: string;
  type?: string
};

export type ListStopsResponse = {
  stops: StopObject[]
}
