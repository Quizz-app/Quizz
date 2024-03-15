import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo({ selected, onSelect }) {
    const [date, setDate] = useState(new Date().toLocaleString("en-US", { timeZone: "Europe/Sofia" }));

    useEffect(() => {
        setDate(new Date(selected).toLocaleString("en-US", { timeZone: "Europe/Sofia" }));
    }, [selected]);

    const handleSelect = (date) => {
        setDate(date);
        onSelect(new Date(date).toLocaleString("en-US", { timeZone: "Europe/Sofia" }));
    };

    return (
        <Popover>
            <PopoverTrigger>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-black text-white" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}