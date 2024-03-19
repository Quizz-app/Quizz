import React, { useEffect, useRef } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "../../../utils/cn";
import PropTypes from "prop-types";
import { animate } from "framer-motion";

import './textGenerate.css';

export const TextGenerateEffect = ({ words, className }) => {
    const scope = useRef();
    let wordsArray = words.split(" ");
    useEffect(() => {
        animate(
            "span",
            {
                opacity: 1,
            },
            {
                duration: 2,
                delay: stagger(0.2),
            }
        );
    }, [scope.current]);

    const renderWords = () => {
        return (
            <motion.div ref={scope}>
                {wordsArray.map((word, idx) => {
                    return (
                        <motion.span
                        key={word + idx}
                        className="dark:text-white opacity-0 text-4xl font-bold noise-text"
                      >
                        {word}{" "}
                      </motion.span>
                    );
                })}
            </motion.div>
        );
    };

    return (
        <div className={cn("font-bold noise-text", className)}>
            <div className="mt-4">
                <div className=" dark:text-white text-black text-2xl leading-snug tracking-wide">
                    {renderWords()}
                </div>
            </div>
        </div>
    );
};

TextGenerateEffect.propTypes = {
    words: PropTypes.string,
    className: PropTypes.string,
};