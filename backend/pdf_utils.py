import pdfplumber

def extract_text_from_pdf(file, max_pages=None):
    """
    Extract text from a PDF file.

    Args:
        file: File-like object of the PDF.
        max_pages: Optional; limit number of pages to extract.

    Returns:
        A string containing all extracted text.
    """
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            pages = pdf.pages
            if max_pages:
                pages = pages[:max_pages]

            for page in pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

    except Exception as e:
        raise RuntimeError(f"Failed to process PDF: {e}")

    return text
