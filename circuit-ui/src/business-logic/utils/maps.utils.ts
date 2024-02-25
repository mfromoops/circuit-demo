import type { Address, MapsResults } from "../types";

export class MapsSearcher {
    constructor(private apiKey: string) {}
    search(address: Address) {
      const query = `${address.street}, ${address.city}, ${address.country}, ${address.zip}`;
      const searchParams = new URLSearchParams({
        address: query,
        key: this.apiKey,
      });
      searchParams.toString();
      return fetch(
        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
          query +
          "&key=" +
          this.apiKey,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => res.json() as unknown as MapsResults)
        .then((res) => {
          Bun.write("Results", JSON.stringify(res.results));
          return res.results[0].geometry.location as { lat: number; lng: number };
        });
    }
  }