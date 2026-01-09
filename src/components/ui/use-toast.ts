// Simplified version of use-toast
export function useToast() {
    return {
        toast: ({ title, description, variant }: any) => {
            console.log('Toast:', title, description);
            // Fallback to alert for visibility in this MVP phase
            if (variant === 'destructive') {
                alert(`Error: ${title}\n${description}`);
            } else {
                // alert(`Success: ${title}\n${description}`);
            }
        }
    }
}
