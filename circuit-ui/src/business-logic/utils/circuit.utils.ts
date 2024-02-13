import { BasicAuthentication } from ".";
import type { PlanObject, ListPlansResponse, StopObject, getPlanResponse as GetPlanResponse, RouteResponse, ListStopsResponse } from "../types";

export class CircuitAPI {
  constructor(private apiKey: string) {}
  testAPIKey() {
    return fetch("https://api.getcircuit.com/public/v0.2b/plans", {
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
      },
    }).then((res) => res.json());
  }
  searchAddress(query: string) {
    const url = "https://api.getcircuit.com/rest/addresses/search"
    const searchMode = "all";
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, searchMode }),
    }).then(res => {
      return res.json();
    })
  }
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
  importStops(planID: `plans/${string}`, stops: StopObject[]) {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${planID}/stops:import`, {
      method: "POST",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stops),
    }).then((res) => res.json());
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
  distributePlan(planID: `plans/${string}`) {
    fetch(`https://api.getcircuit.com/public/v0.2b/${planID}:distribute`, {
      method: "POST",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
      },
    }).then((res) => res.json());
  }
  getPlan(planID: `plans/${string}`): Promise<GetPlanResponse> {
    return fetch(`https://api.getcircuit.com/public/v0.2b/${planID}`, {
      method: "GET",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }
  listPlans(): Promise<ListPlansResponse> {
    return fetch(`https://api.getcircuit.com/public/v0.2b/plans`, {
      method: "GET",
      headers: {
        Authorization: BasicAuthentication(this.apiKey, ""),
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
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
}
