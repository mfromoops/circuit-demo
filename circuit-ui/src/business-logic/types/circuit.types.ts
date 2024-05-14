export type PlanObject = {
  title: string;
  starts: {
    day: number;
    month: number;
    year: number;
  };
  depot?: string;
  id?: `plans/${string}`;
  distributed?: boolean;
  writable?: boolean;
  optimization?: string;
  drivers?: DriverObject[];
};

export type DriverObject = {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
};
export type DriverListResponse = {
  drivers: DriverObject[];
  nextPageToken: string | null;
};
export type ListPlansResponse = {
  plans:
    | (PlanObject & {
        id: string;
        depot: string;
        distributed: boolean;
        writable: boolean;
        optimization: string;
        drivers: DriverObject[];
      })[]
    | undefined;
  nextPageToken: string;
};
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
  };
};
export type getPlanResponse = PlanObject & {
  id: `plans/${string}`;
  depot: string;
  distributed: boolean;
  writable: boolean;
  optimization: string;
  drivers: DriverObject[];
  routes: `routes/${string}`[];
};
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
  deliveryInfo: {
    attempted: boolean;
    attemptedAt: number;
    attemptedLocation: any;
    driverProvidedInternalNotes: any;
    driverProvidedRecipientNotes: any;
    photoUrls: string[];
    recipientProvidedNotes: any[];
    signatureUrl: string;
    signeeName: string;
    succeeded: boolean;
    // state: "delivered_to_recipient";
    state: string;
  };
  driver?: string;
  allowedDrivers?: string[];
  optimizationOrder?: "first" | "last" | "default";
  activity?: "delivery" | "pickup";
  packageCount?: number;
  notes?: string;
  webAppLink?: string;
  type?: string;
};

export type ListStopsResponse = {
  stops: StopObject[];
};

export type Depot = {
  id: string;
  name: string;
};

export type SearchAddressResult = {
  address: string;
  addressLineOne: string;
  addressLineTwo: string;
};
