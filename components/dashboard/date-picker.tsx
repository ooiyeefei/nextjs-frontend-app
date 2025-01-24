'use client'

import { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfDay, isBefore, isSameDay } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import CreateReservationForm from './create-reservation-form';
import ModifyReservationForm from './modify-reservation-form';
import { generateTimeSlots } from '@/lib/utils/reservation';
import { getReservationsByBusinessId } from '@/lib/supabase/queries';
import { Reservation, ReservationForTimeSlotGen, BusinessProfile, ReservationSetting } from '@/types';
import { convertToLocalTime } from '@/lib/utils/date-and-time';

interface TimeSlot {
    start: string;
    end: string;
    available: boolean;
}

interface DatePickerProps {
    restaurant: BusinessProfile;
    operatingHours: Record<string, string>;
    reservationSettings: ReservationSetting[];
    isModifying: boolean;
    initialDate?: Date;
    initialPartySize?: number;
    initialTime?: string;
    confirmationCode?: string;
    reservation?: Reservation;
    onModificationComplete?: () => void;
}

export default function DatePicker({
    restaurant,
    operatingHours,
    reservationSettings,
    isModifying = false,
    initialDate,
    initialPartySize,
    initialTime,
    confirmationCode,
    reservation,
    onModificationComplete
}: DatePickerProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(initialDate || startOfDay(new Date()));
    const [partySize, setPartySize] = useState<number>(initialPartySize || 2);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [currentResSettings, setCurrentResSettings] = useState<ReservationSetting | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(() => {
        if (initialTime) {
            return {
                start: initialTime,
                end: '',
                available: true
            };
        }
        return null;
    });
    const [allReservations, setAllReservations] = useState<ReservationForTimeSlotGen[]>([]);
    const maxDate = useMemo(() => addDays(new Date(), restaurant.max_allowed_booking_advance_hours), [restaurant.max_allowed_booking_advance_hours]);

    // Fetch all reservations once during component mount
    useEffect(() => {
        async function fetchAllReservations() {
            try {
                const { reservations, error } = await getReservationsByBusinessId(restaurant.id, new Date(), maxDate, restaurant.timezone);

                if (error || !reservations) {
                    console.error('Error:', error);
                    return;
                }

                setAllReservations(reservations);
            } catch (error) {
                console.error('Error fetching reservations:', error);
            }
        }

        fetchAllReservations();
    }, [restaurant.id, restaurant.max_allowed_booking_advance_hours, maxDate, restaurant.timezone]);

    // Generate time slots when date or party size changes
    useEffect(() => {
        // Filter reservations for selected date
        const dateReservations = allReservations.filter(reservation => {
            // convert to restaurant time zone
            const resDateInRestaurantTz = convertToLocalTime(new Date(reservation.date), restaurant.timezone)
            console.log('resDateInRestaurantTz: ', resDateInRestaurantTz);
            console.log('selectedDate: ', selectedDate);
            // Compare only the date portion
            return startOfDay(resDateInRestaurantTz).getTime() ===
                startOfDay(selectedDate).getTime();
        });

        console.log('after date filter dateReservations: ', dateReservations);

        const dayOfWeek = selectedDate.getDay();
        const currentSettings = reservationSettings.find(s => s.day_of_week === dayOfWeek && s.is_default) ||
            reservationSettings.find(s => s.specific_date && isSameDay(s.specific_date, selectedDate));

        if (!currentSettings) {
            setTimeSlots([]);
            console.log(`No settings found for date ${selectedDate}.`);
            return;
        }

        const slots = generateTimeSlots(
            selectedDate,
            operatingHours,
            currentSettings.timeslot_length_minutes,
            dateReservations,
            currentSettings.capacity_settings as Record<string, number>,
            partySize,
            restaurant.timezone,
            currentSettings.reservation_start_time,
            currentSettings.reservation_end_time
        );

        setTimeSlots(slots);
        setCurrentResSettings(currentSettings);
    }, [selectedDate, partySize, allReservations, operatingHours, reservationSettings, restaurant.timezone, currentResSettings]);

    useEffect(() => {
        if (isModifying && initialTime && timeSlots.length > 0) {
            const matchingSlot = timeSlots.find(slot => slot.start === initialTime);
            if (matchingSlot) {
                setSelectedSlot(matchingSlot);
            }
        }
    }, [timeSlots, initialTime, isModifying]);

    return (
        <div className="space-y-4">
            <div>
                <Label>Party Size</Label>
                <Select
                    value={partySize.toString()}
                    onValueChange={(value) => setPartySize(parseInt(value))}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select party size" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                                {size} {size === 1 ? 'person' : 'people'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Select Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, "PPP")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={(date) =>
                                isBefore(date, startOfDay(new Date())) ||
                                isBefore(maxDate, date)
                            }
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {timeSlots.length > 0 && (
                <div>
                    <Label>Available Time Slots</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {timeSlots.map((slot) => (
                            <Button
                                key={slot.start}
                                variant={selectedSlot?.start === slot.start ? "default" : "outline"}
                                onClick={() => setSelectedSlot(slot)}
                                disabled={!slot.available}
                                size="sm"
                            >
                                {slot.start}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {selectedSlot && (
                isModifying ? (
                    reservation ? (
                        <ModifyReservationForm
                            selectedDate={selectedDate}
                            selectedTime={selectedSlot.start}
                            partySize={partySize}
                            confirmationCode={confirmationCode ?? ''}
                            restaurant={restaurant}
                            reservation={reservation}
                            onModificationComplete={onModificationComplete}
                            timeSlotLengthMinutes={currentResSettings?.timeslot_length_minutes ?? 0}
                        />
                    ) : null
                ) : (
                    <CreateReservationForm
                        selectedDate={selectedDate}
                        selectedTime={selectedSlot.start}
                        partySize={partySize}
                        restaurant={restaurant}
                        timeSlotLengthMinutes={currentResSettings?.timeslot_length_minutes ?? 0}
                    />
                )
            )}
        </div>
    );
}