import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { IDoesFilterPassParams } from 'ag-grid-community';
import { CustomFilterProps, useGridFilter } from 'ag-grid-react';
import { useCallback, useEffect, useState } from 'react';

const CustomArrayIntersectionFilter = ({ model, onModelChange, getValue, api }: CustomFilterProps<any, any, { value: string[] }>) => {
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>(model?.value || []);

    useEffect(() => {
        if (!api) {
            return;
        }

        const uniqueValues = new Set<string>();
        api.forEachNode((node) => {
            const cellValue = getValue(node) as string[];
            if (cellValue) {
                cellValue.forEach((value) => uniqueValues.add(value));
            }
        });
        setOptions(Array.from(uniqueValues).sort());
    }, [api, getValue]);

    const doesFilterPass = useCallback(({ node }: IDoesFilterPassParams) => {
        const cellValues = getValue(node) as string[];
        return model!.value.every((filterVal) => cellValues.includes(filterVal));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model]);

    // register filter callbacks with the grid
    useGridFilter({ doesFilterPass });

    const handleCheckboxChange = (value: string) => {
        const newSelectedOptions = selectedOptions.includes(value)
            ? selectedOptions.filter((option) => option !== value)
            : [...selectedOptions, value];

        setSelectedOptions(newSelectedOptions);
        onModelChange({ value: newSelectedOptions });
    };

    const handleClear = () => {
        setSelectedOptions([]);
        onModelChange({ value: [] });
    };

    return (
        <div className="ag-filter-container">
            <Button
                onClick={handleClear}
                size="small"
                variant="outlined"
                sx={{ height: '25px', margin: '10px' }}
            >
                Clear
            </Button>

            <FormGroup>
                {options.map((option) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={() => handleCheckboxChange(option)}
                            // size="small"
                            />
                        }
                        label={
                            <Typography sx={{ fontSize: 13 }}>
                                {option}
                            </Typography>
                        }
                        sx={{ margin: '0', height: '30px' }}
                    />
                ))}
            </FormGroup>
        </div>
    );
}

export default CustomArrayIntersectionFilter;