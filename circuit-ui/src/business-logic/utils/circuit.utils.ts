import { BasicAuthentication } from ".";
import type {
  DriverListResponse,
  getPlanResponse as GetPlanResponse,
  ListPlansResponse,
  ListStopsResponse,
  PlanObject,
  RouteResponse,
  StopObject,
} from "../types";

export class CircuitAPI {
  constructor(private apiKey: string) {}

  createPlan(plan: PlanObject) {
    return fetch("https://api.getcircuit.com/public/v0.2b/plans", {
      method: "POST",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plan),
    }).then((res) => res.json());
  }
  createStop(stop: StopObject, planID: `plans/${string}`) {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${planID}/stops`, {
      method: "POST",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stop),
    }).then((res) => res.json());
  }
  distributePlan(planID: `plans/${string}`) {
    fetch(`https://api.getcircuit.com/public/v0.2b/${planID}:distribute`, {
      method: "POST",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
      },
    }).then((res) => res.json());
  }
  getDepots() {
    return fetch("https://api.getcircuit.com/public/v0.2b/depots", {
      method: "GET",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }
  getPlan(planID: `plans/${string}`): Promise<GetPlanResponse | undefined> {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${planID}`, {
      method: "GET",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }
  deletePlan(planID: `plans/${string}`) {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${planID}`, {
      method: "DELETE",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    }).then((res) => res.text());
  }
  getRoute(routeID: `routes/${string}`): Promise<RouteResponse> {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${routeID}`, {
      method: "GET",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }
  importStops(planID: `plans/${string}`, stops: StopObject[]) {
    return fetch(
      `https://api.getcircuit.com/public/v0.2b/${planID}/stops:import`,
      {
        method: "POST",
        headers: {
          Authorization: BasicAuthentication(this.apiKey, ""),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stops),
      },
    ).then((res) => res.json());
  }
  listDrivers(): Promise<DriverListResponse> {
    return fetch("https://api.getcircuit.com/public/v0.2b/drivers", {
      method: "GET",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }
  listPlanDrivers(planId: `plans/${string}`): Promise<DriverListResponse> {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${planId}`, {
      method: "GET",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const drivers = res.drivers;
        return { drivers, nextPageToken: null };
      });
  }
  listPlans(token?: string): Promise<ListPlansResponse> {
    return fetch(
      `https://api.getcircuit.com/public/v0.2b/plans${token ? "?pageToken=" + token : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: BasicAuthentication(this.apiKey, ""),
          "Content-Type": "application/json",
        },
      },
    ).then((res) => res.json());
  }
  listStops(planID: `plans/${string}`): Promise<ListStopsResponse> {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${planID}/stops`, {
      method: "GET",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }
  optimizePlan(planID: `plans/${string}`) {
    fetch(`https://api.getcircuit.com/public/v0.2b/${planID}:optimize`, {
      method: "POST",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
      },
    }).then((res) => res.json());
  }
  searchAddress(query: string) {
    const url = "https://api.getcircuit.com/rest/addresses/search";
    const searchMode = "all";
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, searchMode }),
    }).then((res) => {
      return res.json();
    });
  }
  testAPIKey() {
    return fetch("https://api.getcircuit.com/public/v0.2b/plans", {
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
      },
    }).then((res) => res.json());
  }
  updatePlan(drivers: `drivers/${string}`[], planID: `plans/${string}`) {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${planID}`, {
      method: "PATCH",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        drivers,
      }),
    }).then((res) => res.json());
  }
}
