import { ThemedLoader } from "@/components/ui/themedLoader";

export default function ProtectedLoading() {
    return (
        <div className="fixed inset-0 z-[999] bg-zinc-950 flex items-center justify-center">
            <ThemedLoader 
                isDarkMode={true} 
                text="Accessing Neural Hub" 
                subtext="Decrypting secure channels" 
            />
        </div>
    );
}
