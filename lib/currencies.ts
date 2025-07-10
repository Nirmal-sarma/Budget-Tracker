export const Currencies=[
    { value: "USD", label: "$ Dollar", locale: "en-US" },
    { value: "INR", label: "₹ Indian Rupee", locale: "en-IN" },
    { value: "GBP", label: "£ British Pound", locale: "en-GB" },
    { value: "JPY", label: "¥ Japanese Yen", locale: "ja-JP" },
    { value: "EUR", label: "€ Euro", locale: "de-DE" }
]

export type Currency=(typeof Currencies)[0];