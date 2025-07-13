import numpy as np

def to_serializable(val):
    if isinstance(val, np.generic):
        return val.item()
    if isinstance(val, dict):
        return {k: to_serializable(v) for k, v in val.items()}
    if isinstance(val, list):
        return [to_serializable(v) for v in val]
    return val
