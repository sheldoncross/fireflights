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

// Interface defining the structure for place data enriched with AI suggestions.
interface EnrichedPlaceData {
  place: Place;
  suggestions: {type: 'activity' | 'dining'; description: string}[];
  duration: string;
}

// Initial map view settings (centered on Los Angeles)
const initialMapLocation = {
  lat: 34.0522,
  lng: -118.2437,
  zoom: 10,
};

// Placeholder data displayed before a real itinerary is generated.
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

/**
 * The main page component for the Trip Planner application.
 * Handles user input for trip details, interacts with AI flows to generate
 * and enrich itineraries, and displays the resulting place cards.
 * @returns {JSX.Element} The main page UI.
 */
export default function Home() {
  // State for managing the chat messages
  const [messages, setMessages] = useState<string[]>([]);
  // State for the current input in the chatbox
  const [currentInput, setCurrentInput] = useState<string>('');
  // State for the AI-generated itinerary
  const [itinerary, setItinerary] = useState<GenerateItineraryOutput | null>(null);
  // State for the place data enriched with AI suggestions and details
  const [enrichedPlaces, setEnrichedPlaces] = useState<EnrichedPlaceData[]>([]);
  // State to indicate loading status for AI calls
  const [loading, setLoading] = useState(false);
  // Ref for the chat message container to enable scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Handles sending the user's message (trip details).
   * Clears the input, updates message history, sets loading state,
   * and triggers the AI itinerary generation flow.
   */
  const handleSendMessage = async () => {
    // Ignore empty input
    if (currentInput.trim() === '') return;

    const newMessage = currentInput.trim();
    // Add user message to the chat history
    setMessages([...messages, newMessage]);
    // Clear the input field
    setCurrentInput('');
    // Indicate loading state
    setLoading(true);
    // Clear previous results
    setItinerary(null);
    setEnrichedPlaces([]);

    try {
      // Call the AI flow to generate the itinerary
      const generatedItinerary = await generateItinerary({tripDetails: newMessage});
      setItinerary(generatedItinerary);
    } catch (error: any) {
      console.error('Failed to generate itinerary:', error);
      // Display error state potentially
      setMessages([...messages, newMessage, "Sorry, I couldn't generate an itinerary. Please try again."]);
    } finally {
      // Reset loading state regardless of success or failure
      // Note: Enrichment loading happens in useEffect
      // setLoading(false); // Loading is handled by the enrichment effect now
    }
  };

  // Effect hook to enrich places when the itinerary changes
  useEffect(() => {
    /**
     * Asynchronously fetches details for each location in the generated itinerary,
     * enriches them with AI suggestions (activities, dining) based on the trip context,
     * and updates the state with the enriched place data.
     */
    const enrichItineraryPlaces = async () => {
      // Proceed only if there's a valid itinerary with locations
      if (itinerary?.itinerary && itinerary.itinerary.length > 0) {
        setLoading(true); // Set loading state for enrichment process
        try {
          // Create promises for fetching and enriching each place
          const placesEnrichmentPromises = itinerary.itinerary.map(async (item) => {
            // Fetch detailed place information using the Places service
            const placeDetails = await getPlaceDetails(item.location);

            // Skip if place details couldn't be fetched
            if (!placeDetails) {
              console.warn(`Could not get details for location: ${item.location}`);
              return null;
            }

            // Enrich the fetched place details with AI suggestions
            const enrichedLocationCard = await enrichLocationCard({
              place: placeDetails,
              // Provide the full chat history as context for enrichment
              tripDetails: messages.join('')
            });

            // Combine place details, suggestions, and duration
            return {place: placeDetails, suggestions: enrichedLocationCard.suggestions, duration: item.duration};
          });

          // Wait for all enrichment promises to resolve
          const enrichedPlacesData = (await Promise.all(placesEnrichmentPromises))
            // Filter out any null results (where place details failed)
            .filter((data): data is EnrichedPlaceData => data !== null);

          // Update the state with the successfully enriched places
          setEnrichedPlaces(enrichedPlacesData);
        } catch (error) {
          console.error('Failed to enrich locations:', error);
          // Clear places on error
          setEnrichedPlaces([]);
        } finally {
          // Reset loading state after enrichment attempt
          setLoading(false);
        }
      } else {
        // Clear enriched places if the itinerary is empty or invalid
        setEnrichedPlaces([]);
      }
    };

    // Execute the enrichment process
    enrichItineraryPlaces();
    // Dependency array: re-run the effect if itinerary or messages change
  }, [itinerary, messages]);

  /**
   * Generates a Google Maps embed URL for a given place name.
   * Requires the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
   * @param {string} placeName - The name of the place.
   * @returns {string | null} The embeddable Google Maps URL or null if placeName is empty.
   */
  const getPlaceMapUrl = (placeName: string): string | null => {
    if (!placeName || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return null;
    return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(placeName)}`;
  }

  /**
   * Generates a link to search for a place on Google Maps.
   * @param {string} placeName - The name of the place.
   * @returns {string | null} The Google Maps search URL or null if placeName is empty.
   */
  const getPlaceGoogleMapLink = (placeName: string): string | null => {
    if (!placeName) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
  };

  /**
   * Renders the place cards based on the current state.
   * Shows loading indicators, enriched place cards, or placeholder cards.
   * @returns {JSX.Element} The grid of cards or loading indicators.
   */
  const renderCards = (): JSX.Element => {
    // Display loading indicators while fetching/enriching
    if (loading && enrichedPlaces.length === 0) { // Show skeleton only when initially loading enrichment
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <Card key={i} className="bg-card text-card-foreground shadow-lg flex flex-col animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="bg-muted aspect-video w-full mb-4 rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-5 bg-muted rounded w-1/3 mb-2 border-t pt-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-4/5"></div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      );
    }

    // Display enriched place cards if available
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
                  {/* Embed Google Map or show unavailable message */}
                  {placeMapUrl && googleMapLink ? (
                    <a href={googleMapLink} target="_blank" rel="noopener noreferrer" className="mb-4 aspect-video block hover:opacity-80 transition-opacity">
                      <iframe
                        title={`Map of ${enrichedPlace.place.name}`}
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
                    <div className="mb-4 aspect-video bg-muted flex items-center justify-center rounded">
                      <p className="text-sm text-muted-foreground">Map unavailable</p>
                    </div>
                  )}

                  {/* Display duration */}
                  <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0"/>
                    <span>Duration: {enrichedPlace.duration || 'Not specified'}</span>
                  </div>

                  {/* Display AI suggestions */}
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

    // Display placeholder cards initially or if no itinerary is generated
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
                 {/* Embed Google Map or show unavailable message */}
                 {placeholder.place.name !== "The 'Find My Keys' Adventure" && // Don't show map for placeholders without real locations
                 placeholder.place.name !== "The 'Avoid Eye Contact' Expedition" &&
                 placeholder.place.name !== "The 'Midnight Snack' Pilgrimage" &&
                 placeMapUrl && googleMapLink ? (
                    <a href={googleMapLink} target="_blank" rel="noopener noreferrer" className="mb-4 aspect-video block hover:opacity-80 transition-opacity">
                      <iframe
                        title={`Map of ${placeholder.place.name}`}
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
                    <div className="mb-4 aspect-video bg-muted flex items-center justify-center rounded">
                      <p className="text-sm text-muted-foreground">Map preview not applicable</p>
                    </div>
                  )}

                {/* Display duration */}
                <div className="flex items-center space-x-2 mb-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0"/>
                  <span>Duration: {placeholder.duration || 'Not specified'}</span>
                </div>

                {/* Display placeholder suggestions */}
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

  // Render the main component structure
  return (
    <div className="container mx-auto p-4 max-w-7xl"> {/* Constrain width */}
      {/* Chat Input Section */}
      <div className="mb-8"> {/* Increased bottom margin */}
        <div className="mb-2 font-semibold text-lg">Describe Your Dream Trip</div> {/* Larger heading */}
        {/* Chat Message Display Area */}
        <ScrollArea className="h-[200px] mb-4 rounded-md border p-3 bg-muted/30"> {/* Subtle background */}
          <div ref={chatContainerRef} className="flex flex-col space-y-2"> {/* Added spacing */}
            {messages.map((msg, index) => (
              <div key={index} className={cn(
                "max-w-[75%] p-3 rounded-lg shadow-sm", // Added shadow
                index % 2 !== 0 // User messages on the right
                  ? "bg-primary text-primary-foreground self-end"
                  : "bg-secondary text-secondary-foreground self-start" // AI/System messages on the left
              )}>
                {msg}
              </div>
            ))}
            {/* Display loading indicator within the chat */}
            {loading && messages.length > 0 && (
              <div className="flex items-center p-3 rounded-md bg-muted text-muted-foreground self-start shadow-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating itinerary & suggestions...
              </div>
            )}
          </div>
        </ScrollArea>
        {/* Chat Input Field and Send Button */}
        <div className="flex space-x-2">
          <Input
            placeholder="e.g., A relaxing 5-day beach vacation in Hawaii with some light hiking and good food..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="flex-grow rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-primary" // Improved focus style
            onKeyDown={(e) => {
              // Send message on Enter key press
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent newline on Enter
                handleSendMessage();
              }
            }}
            disabled={loading} // Disable input while loading
          />
          <Button onClick={handleSendMessage} className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50" disabled={loading}>
            <Send className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      {/* Render the place cards */}
      {renderCards()}

      {/* Message shown if itinerary was generated but enrichment failed */}
      {!loading && itinerary && enrichedPlaces.length === 0 && itinerary.itinerary.length > 0 && (
        <p className="text-center text-destructive mt-8 font-medium">
          Generated an itinerary, but couldn't retrieve suggestions or maps for the locations.
          This might be due to network issues or the locations being too specific/uncommon.
          You can try refining your trip details.
        </p>
      )}
    </div>
  );
}
