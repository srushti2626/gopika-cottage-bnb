import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, IndianRupee } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const BookingSection = () => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);

  const pricePerNight = 3500;
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * pricePerNight;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }
    // This would integrate with a payment gateway
    alert(`Booking request submitted!\n\nCheck-in: ${format(checkIn, "PPP")}\nCheck-out: ${format(checkOut, "PPP")}\nGuests: ${guests}\nTotal: ₹${total.toLocaleString()}`);
  };

  return (
    <section id="booking" className="section-padding bg-background">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Book Your Stay
          </span>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            Reserve Your <span className="text-primary">Escape</span>
          </h2>
          <p className="subtitle">
            Select your dates and book directly for the best rates. Instant 
            confirmation and flexible cancellation.
          </p>
        </div>

        {/* Booking Card */}
        <div className="max-w-4xl mx-auto">
          <div className="card-cottage p-6 lg:p-10">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Date Selection */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Select Your Dates
                </h3>

                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Check-in Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12",
                          !checkIn && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Check-out Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12",
                          !checkOut && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date <= (checkIn || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Number of Guests
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                    >
                      -
                    </Button>
                    <div className="flex items-center gap-2 min-w-[100px] justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-lg font-semibold">{guests}</span>
                      <span className="text-muted-foreground">Guests</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setGuests(Math.min(8, guests + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-secondary/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Price Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      ₹{pricePerNight.toLocaleString()} × {nights || 0} nights
                    </span>
                    <span className="font-medium">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="font-medium">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-px bg-border my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-2xl font-heading font-semibold text-primary flex items-center">
                      <IndianRupee className="w-5 h-5" />
                      {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="xl"
                  className="w-full mt-8"
                  onClick={handleBooking}
                  disabled={!checkIn || !checkOut}
                >
                  Confirm Booking
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Free cancellation up to 48 hours before check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
