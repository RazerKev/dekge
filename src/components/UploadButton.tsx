"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={(vissible) => {
            if(!vissible) {
                setIsOpen(vissible)
            }
        }}>
            <DialogTrigger onClick={() => setIsOpen(true) } asChild> 
            {/* 'asChild' makes a custom button as not DialogTrigger inherited. The Button below is main/active*/}
                <Button>Upload PDF</Button>
            </DialogTrigger>

            <DialogContent>
                Example Content
            </DialogContent>
        </Dialog>
    )
    
}

export default UploadButton