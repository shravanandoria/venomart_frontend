import { useState } from 'react';
import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from 'react-accessible-accordion';

function MyAccordion({ setDefaultFilterFetch, property_traits, propsFilter, setPropsFilter }) {
    const handleCheckboxChange = (value) => {
        setDefaultFilterFetch(true)
        if (propsFilter.includes(value)) {
            setPropsFilter(propsFilter.filter((item) => item !== value));
        } else {
            setPropsFilter([...propsFilter, value]);
        }
    };
    return (
        <Accordion>
            {property_traits?.map((e, index) => (
                <AccordionItem key={index} className='accordion-item border-b border-jacarta-100 dark:border-jacarta-600'>
                    <AccordionItemHeading className="accordion-header">
                        <AccordionItemButton className="accordion-button collapsed relative flex w-full items-center justify-between bg-white px-6 py-5 font-display text-jacarta-700 dark:bg-jacarta-700 dark:text-white">
                            {e?.type ? e?.type : e?.trait_type}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                className="accordion-arrow h-4 w-4 fill-jacarta-700 transition-transform dark:fill-white">
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z"></path>
                            </svg>
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel className='accordion-body px-2 pb-4'>
                        <div className="flex flex-col">
                            {e.values.map((value, valueIndex) => (
                                <button
                                    onClick={() => handleCheckboxChange(value.value)}
                                    className="flex items-center justify-between rounded-xl px-4 py-2 hover:bg-jacarta-50 dark:text-jacarta-200 dark:hover:bg-jacarta-600"
                                    key={valueIndex}
                                >
                                    <span className='flex justify-center align-middle'>
                                        <input
                                            type="checkbox"
                                            checked={propsFilter.includes(value.value)}
                                            className="dark:bg-jacarta-600 text-accent border-jacarta-200 focus:ring-accent/20 dark:border-jacarta-500 h-4 w-4 self-start rounded focus:ring-offset-0 mt-1 mr-2"
                                            readOnly
                                        />
                                        {value.value}
                                    </span>
                                    <span>{value.count}</span>
                                </button>
                            ))}
                        </div>
                    </AccordionItemPanel>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

export default MyAccordion;
