import logging

def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

def calculate_conversion_rate(converted: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round((converted / total) * 100, 2)
