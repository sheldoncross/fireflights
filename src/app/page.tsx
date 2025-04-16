'use client';

import React, {useState, useEffect, useRef} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {generateItinerary, GenerateItineraryOutput} from '@/ai/flows/generate-itinerary';
import {enrichLocationCard} from '@/ai/flows/enrich-location-card';
import {Place, getPlaceDetails} from '@/services/places';
import {Textarea} from "@/components/ui/textarea";
import {Loader2, MapPin, Send} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";

interface EnrichedPlaceData {
  place: Place;
  suggestions: {type: 'activity' | 'dining'; description: string}[];
  duration: string;
}

const initialMapLocation = {
  lat: 34.0522,
  lng: -118.2437,
  zoom: 10,
};

const placeholderPlaces: EnrichedPlaceData[] = [
  {
    place: {
      name: "The 'Find My Keys' Adventure",
      description: "A thrilling quest to locate your missing keys. High stakes, unpredictable environments (couch cushions, under the fridge), and potential delays.",
      lat: 0,
      lng: 0,
    },
    suggestions: [
      {type: 'activity', description: 'Check all pockets (again).'},
      {type: 'dining', description: 'Snack break to fuel the search.'},
    ],
    duration: "30 minutes - 3 hours"
  },
  {
    place: {
      name: "The 'Avoid Eye Contact' Expedition",
      description: "Navigate the treacherous waters of social avoidance. Skillfully dodge acquaintances while pretending to be deeply engrossed in your phone.",
      lat: 0,
      lng: 0,
    },
    suggestions: [
      {type: 'activity', description: 'Perfect the art of the quick turn.'},
      {type: 'dining', description: 'Grab a coffee for disguise purposes.'},
    ],
    duration: "Varies, depending on neighborhood density"
  },
  {
    place: {
      name: "The 'Midnight Snack' Pilgrimage",
      description: "A daring raid on the kitchen pantry in the dead of night. Stealth, strategic cupboard maneuvers, and the risk of waking up the entire household are paramount.",
      lat: 0,
      lng: 0,
    },
    suggestions: [
      {type: 'activity', description: 'Decide what snack to get.'},
      {type: 'dining', description: 'Eat it quickly and quietly.'},
    ],
    duration: "15 - 45 minutes"
  },
  {
    place: {
      name: "The 'Unplug the Router' Getaway",
      description: "This app can plan real trips too, like visiting the Amazon, unplugging a router, sky diving and so on.",
      lat: 0,
      lng: 0,
    },
    suggestions: [
      {type: 'activity', description: 'Plan a real trip with AI.'},
      {type: 'dining', description: 'Maybe get sushi.'},
    ],
    duration: "As long as you like"
  },
];

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [itinerary, setItinerary] = useState<GenerateItineraryOutput | null>(null);
  const [enrichedPlaces, setEnrichedPlaces] = useState<EnrichedPlaceData[]>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (currentInput.trim() === '') return;

    const newMessage = currentInput.trim();
    setMessages([...messages, newMessage]);
    setCurrentInput('');
    setLoading(true);

    try {
      const generatedItinerary = await generateItinerary({tripDetails: newMessage});
      setItinerary(generatedItinerary);
    } catch (error: any) {
      console.error('Failed to generate itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const enrichItineraryPlaces = async () => {
      if (itinerary?.itinerary && itinerary.itinerary.length > 0) {
        setLoading(true);
        try {
          const placesEnrichmentPromises = itinerary.itinerary.map(async (item) => {
            const placeDetails = await getPlaceDetails(item.location);
            const enrichedLocationCard = await enrichLocationCard({
              place: placeDetails,
              tripDetails: messages.join('\n'), // Use the entire chat history
            });

            if (!placeDetails) {
              console.warn(`Could not get details for location: ${item.location}`);
              return null;
            }

            return {place: placeDetails, suggestions: enrichedLocationCard.suggestions, duration: item.duration};
          });

          const enrichedPlacesData = (await Promise.all(placesEnrichmentPromises))
            .filter((data): data is EnrichedPlaceData => data !== null);
          setEnrichedPlaces(enrichedPlacesData);
        } catch (error) {
          console.error('Failed to enrich locations:', error);
          setEnrichedPlaces([]);
        } finally {
          setLoading(false);
        }
      } else {
        setEnrichedPlaces([]);
      }
    };

    enrichItineraryPlaces();
  }, [itinerary, messages]); // React to changes in itinerary and messages

  const getPlaceMapUrl = (placeName: string) => {
    if (!placeName) return null;
    return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(placeName)}`;
  }

  const getPlaceGoogleMapLink = (placeName: string) => {
    if (!placeName) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
  };

  const renderCards = () => {
    if (loading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center p-2 rounded-md bg-muted text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </div>
          <div className="flex items-center p-2 rounded-md bg-muted text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </div>
          <div className="flex items-center p-2 rounded-md bg-muted text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </div>
        </div>
      );
    }

    if (enrichedPlaces.length > 0) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrichedPlaces.map((enrichedPlace, index) => {
            const placeMapUrl = getPlaceMapUrl(enrichedPlace.place.name);
            const googleMapLink = getPlaceGoogleMapLink(enrichedPlace.place.name);

            return (
              <Card key={index} className="bg-card text-card-foreground shadow-lg flex flex-col">
                <CardHeader>
                  <CardTitle>{enrichedPlace.place.name}</CardTitle>
                  <CardDescription>{enrichedPlace.place.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {placeMapUrl && googleMapLink ? (
                    <a href={googleMapLink} target="_blank" rel="noopener noreferrer" className="mb-4 aspect-video block">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{border: 0}}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={placeMapUrl}
                      ></iframe>
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">Map unavailable for this location.</p>
                  )}

                  <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4"/>
                    <span>Duration: {enrichedPlace.duration || 'Not specified'}</span>
                  </div>

                  <h3 className="text-md font-semibold mb-2 border-t pt-3">Suggestions:</h3>
                  {enrichedPlace.suggestions.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {enrichedPlace.suggestions.map((suggestion, i) => (
                        <li key={i}>
                          <span className="font-medium capitalize">{suggestion.type}:</span>{' '}
                          {suggestion.description}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific suggestions available.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {placeholderPlaces.map((placeholder, index) => {
          const placeMapUrl = getPlaceMapUrl(placeholder.place.name);
          const googleMapLink = getPlaceGoogleMapLink(placeholder.place.name);
          return (
            <Card key={index} className="bg-card text-card-foreground shadow-lg flex flex-col">
              <CardHeader>
                <CardTitle>{placeholder.place.name}</CardTitle>
                <CardDescription>{placeholder.place.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {placeMapUrl && googleMapLink ? (
                  <a href={googleMapLink} target="_blank" rel="noopener noreferrer" className="mb-4 aspect-video block">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{border: 0}}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={placeMapUrl}
                    ></iframe>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">Map unavailable for this location.</p>
                )}

                <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4"/>
                  <span>Duration: {placeholder.duration || 'Not specified'}</span>
                </div>

                <h3 className="text-md font-semibold mb-2 border-t pt-3">Suggestions:</h3>
                {placeholder.suggestions.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {placeholder.suggestions.map((suggestion, i) => (
                      <li key={i}>
                        <span className="font-medium capitalize">{suggestion.type}:</span>{' '}
                        {suggestion.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific suggestions available.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <div className="mb-2 font-semibold">Trip Details Chat</div>
        <ScrollArea className="h-[200px] mb-2 rounded-md border p-2">
          <div ref={chatContainerRef} className="flex flex-col">
            {messages.map((msg, index) => (
              <div key={index} className={cn(
                "mb-1 p-2 rounded-md",
                index % 2 === 0 ? "bg-secondary text-secondary-foreground self-start" : "bg-primary text-primary-foreground self-end"
              )}>
                {msg}
              </div>
            ))}
            {loading && (
              <div className="flex items-center p-2 rounded-md bg-muted text-muted-foreground self-start">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter your trip details and preferences..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="w-full rounded-md shadow-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} className="bg-primary text-primary-foreground hover:bg-primary/80" disabled={loading}>
            <Send className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      {renderCards()}

      {!loading && itinerary && enrichedPlaces.length === 0 && (
        <p className="text-center text-destructive mt-8">Could not retrieve details for the generated locations. Please try refining your trip details.</p>
      )}
    </div>
  );
}
