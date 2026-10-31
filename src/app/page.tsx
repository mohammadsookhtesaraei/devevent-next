import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import type { IEvent } from "@/models/Event.model";
import { cacheLife } from "next/cache";


const Base_Url=process.env.BASE_URL;

const Home = async() => {
  "use cache"
  cacheLife("hours");

  const response=await fetch(`${Base_Url}/api/events`);
  const {events}=await response.json();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can't Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7 px-4">
        <h3>Featured Events</h3>
        <ul className="events">
          {events && events.length > 0 && events.map((event:IEvent)=>(
            <li key={event.title} className="list-none">
               <EventCard {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
export default Home;
